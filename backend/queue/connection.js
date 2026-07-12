import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Single shared connection — BullMQ requires maxRetriesPerRequest: null
let _connection = null;

export function getRedisConnection() {
  if (!_connection) {
    _connection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,   // required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
    });

    _connection.on("error", (err) => {
      // Only log, don't crash — Redis may not be available in dev
      console.warn("[Redis] Connection error:", err.message);
    });
  }
  return _connection;
}
