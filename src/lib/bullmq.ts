/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue, Worker, Job, ConnectionOptions } from "bullmq";
import { config } from "../config/env.js";

const connection: ConnectionOptions = {
  url: config.REDIS_URL,
};

export const defaultQueue = new Queue("default", { connection });

export const initWorker = (
  name: string,
  handler: (job: Job) => Promise<any>,
) => {
  const worker = new Worker(name, handler, { connection });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed!`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed with ${err.message}`);
  });

  return worker;
};
