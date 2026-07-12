import { Worker } from "bullmq";
import { getRedisConnection } from "./connection.js";
import { checkService } from "../loggService/loggService.js";
import { QUEUE_NAME } from "./monitorQueue.js";

// ── Worker config ─────────────────────────────────────────────────────────────
// concurrency = how many jobs run in parallel per worker process.
// Scale horizontally by running multiple worker processes (Docker replicas).
// Each process handles `concurrency` jobs in parallel via event loop.
// At concurrency=50 and a 200ms avg check time:
//   one worker → ~250 checks/sec → ~15,000 checks/min
// Ten workers  → ~2,500 checks/sec → ~150,000 checks/min
const WORKER_CONCURRENCY = Number(process.env.WORKER_CONCURRENCY) || 50;

let _worker = null;

export function startWorker() {
  if (_worker) return _worker;

  _worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { serviceId } = job.data;
      if (!serviceId) throw new Error("Missing serviceId in job data");
      await checkService(serviceId);
    },
    {
      connection:  getRedisConnection(),
      concurrency: WORKER_CONCURRENCY,
      // Stalled jobs are re-queued after 30s (if a worker crashes mid-check)
      stalledInterval: 30_000,
      maxStalledCount: 1,
    }
  );

  _worker.on("completed", (job) => {
    console.log(`[Worker] ✓ Job ${job.id} completed (serviceId: ${job.data.serviceId})`);
  });

  _worker.on("failed", (job, err) => {
    console.error(`[Worker] ✗ Job ${job?.id} failed: ${err.message}`);
  });

  _worker.on("error", (err) => {
    console.error("[Worker] Error:", err.message);
  });

  console.log(`[Worker] Started with concurrency=${WORKER_CONCURRENCY}`);
  return _worker;
}

export async function stopWorker() {
  if (_worker) {
    await _worker.close();
    _worker = null;
    console.log("[Worker] Stopped");
  }
}
