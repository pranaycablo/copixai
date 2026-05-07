const VideoProductionService = require('./VideoProductionService');

/**
 * Task Queue Service
 * Manages concurrent production jobs and prevents server overload.
 */
class TaskQueueService {
  constructor() {
    this.queue = [];
    this.activeWorkers = 0;
    this.MAX_CONCURRENT_JOBS = 3; // Adjust based on server GPU/CPU
  }

  async addToQueue(task) {
    console.log(`[QUEUE] Adding Task ${task.id} to queue.`);
    this.queue.push(task);
    this.processQueue();
  }

  async processQueue() {
    if (this.activeWorkers >= this.MAX_CONCURRENT_JOBS || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    this.activeWorkers++;
    
    try {
      console.log(`[QUEUE] Processing Task ${task.id}. Active Workers: ${this.activeWorkers}`);
      await VideoProductionService.generateVideo(task.id, task.details);
    } catch (err) {
      console.error(`[QUEUE] Task ${task.id} failed:`, err);
    } finally {
      this.activeWorkers--;
      this.processQueue(); // Pick next task
    }
  }

  getQueueStatus(taskId) {
    const pos = this.queue.findIndex(t => t.id === taskId);
    return {
      position: pos !== -1 ? pos + 1 : 0,
      isProcessing: pos === -1 && this.activeWorkers > 0
    };
  }
}

module.exports = new TaskQueueService();
