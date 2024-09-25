type Job = {
    data: any;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    result?: any;
  };
  
  class Queue {
    private jobs: Map<string, Job> = new Map();
  
    addJob(id: string, data: any): void {
      this.jobs.set(id, { data, status: 'pending' });
    }
  
    getJob(id: string): Job | undefined {
      return this.jobs.get(id);
    }
  
    updateJob(id: string, update: Partial<Job>): void {
      const job = this.jobs.get(id);
      if (job) {
        this.jobs.set(id, { ...job, ...update });
      }
    }
  }
  
  export const queue = new Queue();