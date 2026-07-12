import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MonitorLog = new Schema({
  hitTime: { type: Date, default: Date.now, index: true },
  responseTime: { type: Number, default: 0 },
  status: { type: Number, default: 0 },
});

export default mongoose.model("MonitorLog", MonitorLog);
