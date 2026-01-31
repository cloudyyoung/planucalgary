import { Queue } from "bullmq";
import { defaultQueueOptions } from "./config";


export const catalogQueue = new Queue("catalog", defaultQueueOptions)

export const queues: Queue[] = [
    catalogQueue,
]
