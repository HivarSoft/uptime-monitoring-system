import MonitorLog from "../models/MonitorLog.js";
import Service from "../models/Service.js";
import AlertChannel from "../models/AlertChannel.js";
import axios from "axios";
import nodemailer from "nodemailer";

const CONCURRENCY_LIMIT   = 50;
const REQUEST_TIMEOUT_MS  = 10_000;
const MAX_LOGS_PER_SERVICE = 144 * 30; // ~30 days at 10-min intervals

// ── HTTP check ────────────────────────────────────────────────────────────────

const checkUrl = async (url) => {
  const startTime = Date.now();
  let status = 0;
  try {
    const res = await axios.get(url.toString(), {
      timeout: REQUEST_TIMEOUT_MS,
      maxRedirects: 5,
      validateStatus: () => true,
    });
    status = res.status;
  } catch (err) {
    status = err.response ? err.response.status : 0;
  }
  return { status, responseTime: Date.now() - startTime };
};

// ── Alert dispatch ────────────────────────────────────────────────────────────

const sendAlert = async (channel, payload) => {
  try {
    const { type, config } = channel;

    if (type === "email") {
      const transporter = nodemailer.createTransport({
        host: config.smtpHost, port: config.smtpPort || 587,
        secure: config.smtpSecure ?? false,
        auth: { user: config.smtpUser, pass: config.smtpPass },
      });
      await transporter.sendMail({
        from: config.fromEmail || config.smtpUser,
        to: config.toEmail,
        subject: payload.subject, html: payload.html, text: payload.text,
      });
      return;
    }

    if (["slack", "discord", "webhook"].includes(type)) {
      const body =
        type === "slack"   ? { text: payload.text } :
        type === "discord" ? { content: payload.text } :
        { ...payload };
      await axios.post(config.webhookUrl, body, { timeout: 8000 });
      return;
    }

    if (type === "telegram") {
      await axios.post(
        `https://api.telegram.org/bot${config.botToken}/sendMessage`,
        { chat_id: config.chatId, text: payload.text, parse_mode: "HTML" },
        { timeout: 8000 }
      );
    }
  } catch (err) {
    console.error(`[Alert] ${channel.type}/${channel.name}: ${err.message}`);
  }
};

const buildAlertPayload = (service, event) => {
  const isDown  = event === "down";
  const emoji   = isDown ? "🔴" : "🟢";
  const verb    = isDown ? "is DOWN" : "has RECOVERED";
  const subject = `${emoji} ${service.serviceName} ${verb}`;
  const text    = `${emoji} *${service.serviceName}* ${verb}\nURL: ${service.url}\nTime: ${new Date().toUTCString()}`;
  const html    = `<h2>${subject}</h2><p><b>URL:</b> ${service.url}</p><p><b>Time:</b> ${new Date().toUTCString()}</p>`;
  return { subject, text, html, event };
};

const dispatchAlerts = async (service, event) => {
  if (!service.alertsEnabled || !service.alertChannels?.length) return;
  const channels = await AlertChannel.find({
    _id: { $in: service.alertChannels }, enabled: true,
  }).lean();
  const payload = buildAlertPayload(service, event);
  await Promise.allSettled(channels.map((ch) => sendAlert(ch, payload)));
};

// ── Core check (called by BullMQ worker) ─────────────────────────────────────

export const checkService = async (serviceId) => {
  const service = await Service.findById(serviceId);
  if (!service) return;

  const { status, responseTime } = await checkUrl(service.url);

  // Save log
  const log = new MonitorLog({ hitTime: new Date(), responseTime, status });
  await log.save();

  service.monitorLogs.push(log._id);
  if (service.monitorLogs.length > MAX_LOGS_PER_SERVICE) {
    const excess = service.monitorLogs.splice(0, service.monitorLogs.length - MAX_LOGS_PER_SERVICE);
    MonitorLog.deleteMany({ _id: { $in: excess } }).catch(() => {});
  }

  // Counters
  service.currentStatus = status;
  service.lastCheckedAt = new Date();
  service.nextCheckAt   = new Date(Date.now() + (service.checkIntervalMins || 10) * 60_000);

  const isUp = status >= 200 && status < 300;
  if (isUp) {
    service.upCount++;
    service.consecutiveSuccesses++;
    service.consecutiveFailures = 0;
  } else {
    service.downCount++;
    service.consecutiveFailures++;
    service.consecutiveSuccesses = 0;
  }

  // Rolling avg response time
  const totalChecks = service.upCount + service.downCount;
  if (totalChecks > 0) {
    service.avgResponseTime = Math.round(
      (service.avgResponseTime * (totalChecks - 1) + responseTime) / totalChecks
    );
  }

  // ── Incident state machine ──────────────────────────────────────────────
  const failThr  = service.failThreshold     || 1;
  const recovThr = service.recoveryThreshold || 1;
  const prev     = service.incidentState;

  if (prev !== "down" && service.consecutiveFailures >= failThr) {
    service.incidentState  = "down";
    service.lastIncidentAt = new Date();
    console.log(`[⬇ DOWN] ${service.serviceName} after ${service.consecutiveFailures} failures`);
    await service.save();
    await dispatchAlerts(service, "down");
    return;
  }

  if (prev === "down" && service.consecutiveSuccesses >= recovThr) {
    service.incidentState = "up";
    console.log(`[⬆ UP] ${service.serviceName} recovered`);
    await service.save();
    await dispatchAlerts(service, "recovered");
    return;
  }

  if (isUp && prev !== "down") service.incidentState = "up";
  await service.save();
};

// ── Scheduler tick ────────────────────────────────────────────────────────────

/**
 * Called every minute by cron.
 * Finds services whose nextCheckAt has elapsed and either:
 *   a) Enqueues them to BullMQ (if Redis available) — scalable path
 *   b) Falls back to direct in-process checks — no Redis required
 */
export const schedulerTick = async () => {
  try {
    const now = new Date();
    const due = await Service.find({
      $or: [
        { nextCheckAt: { $lte: now } },
        { nextCheckAt: { $exists: false } },
        { nextCheckAt: null },
      ],
    }).select("_id serviceName").lean();

    if (!due.length) return;

    console.log(`[Scheduler] ${due.length} service(s) due`);

    // Try BullMQ path first
    try {
      const { enqueueBulk } = await import("../queue/monitorQueue.js");
      await enqueueBulk(due.map((s) => s._id.toString()));
      console.log(`[Scheduler] Enqueued ${due.length} jobs to BullMQ`);
    } catch (redisErr) {
      // Redis unavailable — run directly (dev / no-Redis environments)
      console.warn("[Scheduler] Redis unavailable, running checks directly:", redisErr.message);
      for (let i = 0; i < due.length; i += CONCURRENCY_LIMIT) {
        const chunk = due.slice(i, i + CONCURRENCY_LIMIT);
        await Promise.allSettled(chunk.map((s) => checkService(s._id)));
      }
    }
  } catch (err) {
    console.error("[schedulerTick] Error:", err.message);
  }
};

/** Called when a new service is created — immediate first check */
export const initializeService = async (service) => {
  try {
    // Try to enqueue for immediate processing
    const { enqueueCheck } = await import("../queue/monitorQueue.js");
    await enqueueCheck(service._id.toString(), `init-${service._id}`);
  } catch {
    // Fallback to direct check
    await checkService(service._id).catch(() => {});
  }
};

/** Legacy alias */
export const loggService = schedulerTick;
