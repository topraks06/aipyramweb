import { ActionRunner } from "../execution/actionRunner";

/**
 * Swarm Queue v2.0 — Real Execution Queue
 *
 * ÖNCEKİ SORUN: setTimeout(2000) + "completed" yazıyordu. SAHTE.
 * FIX: ActionRunner'a bağlandı. Gerçek iş yapıyor.
 */

interface QueueJob {
  jobId: string;
  project: string;
  task: string;
  actionType?: string;
  command?: string;
  context: Record<string, any>;
  status?: "queued" | "processing" | "completed" | "failed";
  createdAt?: string;
  result?: any;
}

// In-memory job storage
const jobQueue: Map<string, QueueJob> = new Map();

/**
 * Push a new job to the queue and execute it.
 */
export async function pushToQueue(job: QueueJob): Promise<void> {
  const enrichedJob: QueueJob = {
    ...job,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  jobQueue.set(job.jobId, enrichedJob);
  console.log(`[Queue v2.0] Job ${job.jobId} kuyruğa alındı. Boyut: ${jobQueue.size}`);

  // Gerçek execution (fire-and-forget)
  processJobAsync(enrichedJob);
}

/**
 * Get the status of a queued job.
 */
export function getJobStatus(jobId: string): QueueJob | null {
  return jobQueue.get(jobId) || null;
}

/**
 * Get all jobs (for admin dashboard).
 */
export function getAllJobs(): QueueJob[] {
  return Array.from(jobQueue.values());
}

/**
 * GERÇEK iş yapan processor.
 * ÖNCEKİ HALİ: setTimeout(2000) + "completed" (SAHTE)
 * YENİ HALİ: ActionRunner üzerinden fiziksel komut çalıştırma
 */
async function processJobAsync(job: QueueJob): Promise<void> {
  job.status = "processing";
  jobQueue.set(job.jobId, job);

  try {
    const actionType = job.actionType || "SHELL_COMMAND";
    const payload = job.command
      ? { command: job.command }
      : { command: `echo "Job ${job.jobId}: ${job.task}"` };

    console.log(`[Queue v2.0] Job ${job.jobId} ActionRunner'a gönderiliyor: ${actionType}`);

    const result = await ActionRunner.getInstance().execute(
      job.jobId,
      actionType,
      { ...payload, ...job.context }
    );

    job.status = "completed";
    job.result = result || { message: `Job ${job.jobId} tamamlandı.` };
    jobQueue.set(job.jobId, job);

    console.log(`[Queue v2.0] ✅ Job ${job.jobId} başarıyla tamamlandı.`);
  } catch (error: any) {
    job.status = "failed";
    job.result = { error: error.message };
    jobQueue.set(job.jobId, job);

    console.error(`[Queue v2.0] ❌ Job ${job.jobId} başarısız:`, error.message);
  }
}
