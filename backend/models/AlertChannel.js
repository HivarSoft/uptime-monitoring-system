import mongoose from "mongoose";
const Schema = mongoose.Schema;

/**
 * AlertChannel — stores a single notification destination for a user.
 *
 * Supported types:
 *   email    — SMTP via nodemailer, or Resend/SendGrid via HTTP
 *   webhook  — generic HTTP POST (Slack-compatible, custom payloads)
 *   slack    — Slack Incoming Webhook URL
 *   discord  — Discord Webhook URL
 *   telegram — Bot token + chat_id
 */
const AlertChannel = new Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true }, // e.g. "My Gmail", "Ops Slack"
    type: {
      type: String,
      required: true,
      enum: ["email", "webhook", "slack", "discord", "telegram"],
    },

    enabled: { type: Boolean, default: true },

    // ── Type-specific config (all optional, only relevant fields populated) ──
    config: {
      // email - API-based (Resend, SendGrid, etc.)
      emailProvider: { type: String, enum: ['smtp', 'resend'], default: 'smtp' }, // 'smtp' or 'resend'
      apiKey:     { type: String },   // For Resend API (use instead of SMTP on Railway)
      toEmail:    { type: String },   // recipient address
      fromEmail:  { type: String },   // sender address
      
      // email - SMTP (traditional, blocked on Railway Free/Hobby)
      smtpHost:   { type: String },
      smtpPort:   { type: Number },
      smtpUser:   { type: String },
      smtpPass:   { type: String },   // stored as-is; encrypt at rest in production
      smtpSecure: { type: Boolean, default: false }, // false = STARTTLS (587), true = SSL (465)

      // webhook / slack / discord
      webhookUrl: { type: String },

      // telegram
      botToken:   { type: String },
      chatId:     { type: String },
    },

    // Last test result
    lastTestedAt:     { type: Date },
    lastTestSuccess:  { type: Boolean },
    lastTestMessage:  { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("AlertChannel", AlertChannel);
