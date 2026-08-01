/**
 * In-memory job queue (BullMQ-compatible interface).
 * Replace with Redis + BullMQ for production scaling.
 */

export type JobType =
  | 'whatsapp-notification'
  | 'email-notification'
  | 'push-notification'
  | 'audit-event';

interface Job {
  id: string;
  type: JobType;
  data: Record<string, unknown>;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

type JobProcessor = (data: Record<string, unknown>) => Promise<void>;

const processors: Map<JobType, JobProcessor> = new Map();
const failedJobs: Job[] = [];

let jobCounter = 0;

function generateJobId(): string {
  return `job-${Date.now()}-${++jobCounter}`;
}

async function processJob(job: Job): Promise<void> {
  const processor = processors.get(job.type);
  if (!processor) {
    console.warn(`[Queue] No processor for job type: ${job.type}`);
    return;
  }

  try {
    await processor(job.data);
  } catch (err) {
    job.attempts++;
    console.error(`[Queue] Job ${job.id} failed (attempt ${job.attempts}/${job.maxAttempts}):`, err);

    if (job.attempts < job.maxAttempts) {
      // Exponential backoff
      const delay = Math.pow(2, job.attempts) * 1000;
      setTimeout(() => processJob(job), delay);
    } else {
      console.error(`[Queue] Job ${job.id} moved to dead letter queue`);
      failedJobs.push(job);
    }
  }
}

export function registerProcessor(type: JobType, processor: JobProcessor): void {
  processors.set(type, processor);
}

export function addJob(
  type: JobType,
  data: Record<string, unknown>,
  options: { maxAttempts?: number } = {}
): string {
  const job: Job = {
    id: generateJobId(),
    type,
    data,
    attempts: 0,
    maxAttempts: options.maxAttempts || 3,
    createdAt: new Date(),
  };

  // Non-blocking: schedule on next tick
  setImmediate(() => processJob(job));

  return job.id;
}

export function getQueueStats() {
  return {
    failedJobs: failedJobs.length,
    registeredProcessors: [...processors.keys()],
  };
}

// Initialize default processors
registerProcessor('audit-event', async (data) => {
  // Audit events are handled synchronously in services
  console.log('[Queue] Audit event:', data.action);
});

registerProcessor('whatsapp-notification', async (data) => {
  // Placeholder - integrate with WhatsApp API
  console.log('[Queue] WhatsApp notification queued for:', data.phone);
});

registerProcessor('email-notification', async (data) => {
  console.log('[Queue] Email notification queued for:', data.email);
});
