import AlertChannel from "../models/AlertChannel.js";
import nodemailer from "nodemailer";
import axios from "axios";

// ── List all channels for the current user ────────────────────────────────────
export const getAlertChannels = async (req, res) => {
  try {
    const channels = await AlertChannel.find({ userId: req.user.id })
      .select("-config.smtpPass -config.botToken") // never expose secrets in list
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, channels });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ── Get a single channel (mask secrets) ──────────────────────────────────────
export const getAlertChannelById = async (req, res) => {
  try {
    const channel = await AlertChannel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();

    if (!channel) {
      return res.status(404).json({ success: false, message: "Alert channel not found" });
    }

    // Mask credential fields
    if (channel.config?.smtpPass) channel.config.smtpPass = "••••••••";
    if (channel.config?.botToken) channel.config.botToken = "••••••••";

    return res.status(200).json({ success: true, channel });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ── Create a channel ──────────────────────────────────────────────────────────
export const createAlertChannel = async (req, res) => {
  try {
    const { name, type, config } = req.body;
    
    console.log("[createAlertChannel] Request body:", { name, type, config: { ...config, smtpPass: "***" } });
    console.log("[createAlertChannel] User ID:", req.user.id);

    if (!name || !type) {
      return res.status(400).json({ success: false, message: "name and type are required" });
    }

    const VALID_TYPES = ["email", "webhook", "slack", "discord", "telegram"];
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: `type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    // Minimal validation per type
    if (type === "email" && (!config?.smtpHost || !config?.smtpUser || !config?.smtpPass || !config?.toEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: "Email channels require smtpHost, smtpUser, smtpPass, and toEmail. For Resend SMTP, fromEmail is also required." 
      });
    }
    
    // Validate email format if provided
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const toEmail = (config?.toEmail || '').trim();
      
      if (!emailRegex.test(toEmail)) {
        return res.status(400).json({ success: false, message: "Invalid toEmail address format" });
      }
      
      // For Resend-like services (smtpUser is not an email), fromEmail is required
      const smtpUserIsEmail = emailRegex.test((config?.smtpUser || '').trim());
      if (!smtpUserIsEmail && !config?.fromEmail) {
        return res.status(400).json({ 
          success: false, 
          message: "fromEmail is required when smtpUser is not a valid email (e.g., for Resend SMTP, use a verified domain email)" 
        });
      }
      
      // Validate fromEmail if provided
      if (config?.fromEmail) {
        const fromEmail = config.fromEmail.trim();
        if (!emailRegex.test(fromEmail)) {
          return res.status(400).json({ 
            success: false, 
            message: "Invalid fromEmail address format. Use: email@yourdomain.com (must be verified in Resend)" 
          });
        }
      }
    }
    if (["webhook", "slack", "discord"].includes(type) && !config?.webhookUrl) {
      return res.status(400).json({ success: false, message: `${type} channels require a webhookUrl` });
    }
    if (type === "telegram" && (!config?.botToken || !config?.chatId)) {
      return res.status(400).json({ success: false, message: "Telegram channels require botToken and chatId" });
    }

    const channel = new AlertChannel({
      userId: req.user.id,
      name: name.trim(),
      type,
      config: config || {},
    });

    await channel.save();

    // Return without secret fields
    const safe = channel.toObject();
    if (safe.config?.smtpPass) safe.config.smtpPass = "••••••••";
    if (safe.config?.botToken) safe.config.botToken = "••••••••";

    return res.status(201).json({ success: true, channel: safe });
  } catch (err) {
    console.error("[createAlertChannel] Error:", err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ── Update a channel ──────────────────────────────────────────────────────────
export const updateAlertChannel = async (req, res) => {
  try {
    const channel = await AlertChannel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!channel) {
      return res.status(404).json({ success: false, message: "Alert channel not found" });
    }

    const { name, enabled, config } = req.body;
    if (name    != null) channel.name    = name.trim();
    if (enabled != null) channel.enabled = Boolean(enabled);

    if (config) {
      // Merge config — don't overwrite secrets with masked values
      for (const [key, value] of Object.entries(config)) {
        if (value !== "••••••••") {
          channel.config[key] = value;
        }
      }
      channel.markModified("config");
    }

    await channel.save();
    return res.status(200).json({ success: true, message: "Alert channel updated" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ── Delete a channel ──────────────────────────────────────────────────────────
export const deleteAlertChannel = async (req, res) => {
  try {
    const result = await AlertChannel.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) {
      return res.status(404).json({ success: false, message: "Alert channel not found" });
    }
    return res.status(200).json({ success: true, message: "Alert channel deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};

// ── Test a channel ────────────────────────────────────────────────────────────
export const testAlertChannel = async (req, res) => {
  try {
    const channel = await AlertChannel.findOne({ _id: req.params.id, userId: req.user.id });
    if (!channel) {
      return res.status(404).json({ success: false, message: "Alert channel not found" });
    }

    const { type, config } = channel;
    const testMsg = {
      subject: "✅ PulseWatch — Test Alert",
      text:    "✅ Test alert from PulseWatch. Your alert channel is working correctly.",
      html:    "<h2>✅ Test Alert</h2><p>Your PulseWatch alert channel is configured correctly.</p>",
    };

    let success = false;
    let message = "";

    try {
      if (type === "email") {
        console.log("[testAlertChannel] Email config:", {
          smtpHost: config.smtpHost,
          smtpPort: config.smtpPort,
          smtpUser: config.smtpUser,
          smtpPassLength: config.smtpPass?.length || 0,
          smtpPassExists: !!config.smtpPass,
          fromEmail: config.fromEmail,
          toEmail: config.toEmail
        });
        
        const transporter = nodemailer.createTransport({
          host:   config.smtpHost,
          port:   config.smtpPort || 587,
          secure: config.smtpSecure ?? false,
          auth:   { user: config.smtpUser, pass: config.smtpPass },
        });
        await transporter.verify();
        
        // For Resend and similar services, fromEmail is REQUIRED since smtpUser is not an email
        let fromEmail = config.fromEmail;
        
        // If no fromEmail provided, fallback to smtpUser (for traditional SMTP)
        if (!fromEmail) {
          fromEmail = config.smtpUser;
        }
        
        // Clean up any whitespace
        fromEmail = fromEmail?.trim();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailToValidate = fromEmail.replace(/.*<(.+)>.*/, '$1'); // Extract email from "Name <email>"
        
        if (!emailRegex.test(emailToValidate)) {
          throw new Error(`Invalid or missing fromEmail address. For Resend SMTP, fromEmail must be a verified email address (e.g., noreply@yourdomain.com), not "${fromEmail}"`);
        }
        
        // Format as "Name <email@domain.com>" if not already formatted
        const from = fromEmail.includes('<') ? fromEmail : `PulseWatch <${fromEmail}>`;
        
        await transporter.sendMail({
          from: from,
          to:   config.toEmail,
          subject: testMsg.subject,
          html:    testMsg.html,
          text:    testMsg.text,
        });
        success = true;
        message = `Test email sent to ${config.toEmail}`;
      }

      if (type === "slack" || type === "discord" || type === "webhook") {
        const body =
          type === "slack"   ? { text: testMsg.text } :
          type === "discord" ? { content: testMsg.text } :
          { ...testMsg };
        await axios.post(config.webhookUrl, body, { timeout: 8000 });
        success = true;
        message = "Test message delivered to webhook";
      }

      if (type === "telegram") {
        await axios.post(
          `https://api.telegram.org/bot${config.botToken}/sendMessage`,
          { chat_id: config.chatId, text: testMsg.text },
          { timeout: 8000 }
        );
        success = true;
        message = `Test message sent to Telegram chat ${config.chatId}`;
      }
    } catch (err) {
      message = err.message;
    }

    // Persist test result
    channel.lastTestedAt    = new Date();
    channel.lastTestSuccess = success;
    channel.lastTestMessage = message;
    await channel.save();

    return res.status(success ? 200 : 422).json({ success, message });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
