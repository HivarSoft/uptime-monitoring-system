import { Queue } from "bullmq";
import { getRedisConnection } from "./connection.js";

export const QUEUE_NAME = "monitor-checks";

let _queue = null;

/**
 * Returns the singleton Queue instance.
 * Safe to call before Redis is fully connected — BullMQ queues
 * buffer operations until the connection is ready.
 */
export function getQueue() {
  if (!_queue) {
    _queue = new Queue(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: "fixed", delay: 5000 },
        removeOnComplete: { count: 500 },
        removeOnFail:     { count: 200 },
      },
    });
  }
  return _queue;
}

/**
 * Enqueue a single service check job.
 * @param {string} serviceId  MongoDB ObjectId as string
 * @param {string} [jobId]    Optional deduplication key
 */
export async function enqueueCheck(serviceId, jobId) {
  const queue = getQueue();
  await queue.add(
    "check",
    { serviceId },
    { jobId: jobId || `check-${serviceId}-${Date.now()}` }
  );
}

/**
 * Enqueue many service IDs at once (bulk add).
 * BullMQ handles this in a single Redis pipeline — extremely efficient.
 * @param {string[]} serviceIds
 */
export async function enqueueBulk(serviceIds) {
  if (!serviceIds.length) return;
  const queue = getQueue();
  const jobs = serviceIds.map((id) => ({
    name: "check",
    data: { serviceId: id },
    opts: {
      jobId: `check-${id}-${Date.now()}`,
      attempts: 2,
      backoff: { type: "fixed", delay: 5000 },
    },
  }));
  await queue.addBulk(jobs);
}
