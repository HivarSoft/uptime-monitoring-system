import mongoose from "mongoose";
const Schema = mongoose.Schema;

const Service = new Schema({
  serviceName:   { type: String, required: true },
  url:           { type: String, required: true },

  // ── Monitoring config ─────────────────────────────────────────────────────
  checkIntervalMins: { type: Number, default: 10, min: 1, max: 1440 },
  // How many consecutive failures before status flips to DOWN and alerts fire
  failThreshold:     { type: Number, default: 1, min: 1, max: 10 },
  // How many consecutive successes before status flips to UP (recovered)
  recoveryThreshold: { type: Number, default: 1, min: 1, max: 10 },

  // ── Runtime state ─────────────────────────────────────────────────────────
  consecutiveFailures:  { type: Number, default: 0 },
  consecutiveSuccesses: { type: Number, default: 0 },
  // "unknown" | "up" | "down"
  incidentState: { type: String, default: "unknown" },
  lastIncidentAt: { type: Date },

  // ── Counters ──────────────────────────────────────────────────────────────
  upCount:    { type: Number, default: 0 },
  downCount:  { type: Number, default: 0 },
  currentStatus:   { type: Number, default: 0 },
  lastCheckedAt:   { type: Date },
  nextCheckAt:     { type: Date },
  avgResponseTime: { type: Number, default: 0 },

  // ── Alerts ────────────────────────────────────────────────────────────────
  alertsEnabled: { type: Boolean, default: false },
  alertChannels: [{ type: mongoose.SchemaTypes.ObjectId, ref: "AlertChannel" }],

  // ── Refs ──────────────────────────────────────────────────────────────────
  projectId:   { type: mongoose.SchemaTypes.ObjectId, ref: "Project" },
  monitorLogs: [{ type: mongoose.SchemaTypes.ObjectId, ref: "MonitorLog" }],
});

// Index for scheduler: find services due for a check
Service.index({ nextCheckAt: 1 });

export default mongoose.model("Service", Service);
