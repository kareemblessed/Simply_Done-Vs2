
// ============================================================================
// OBSERVER SERVICE
// Path: src/server/services/observerService.ts
// ============================================================================

import { Task } from '../../shared/types/task.types';

export type TaskChangeType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface TaskChange {
  type: TaskChangeType;
  taskId?: string;
  task?: Task;
  delta?: Partial<Task>;
}

export interface TaskObserver {
  update(change: TaskChange): void;
}

class ObserverService {
  private observers: TaskObserver[] = [];

  subscribe(observer: TaskObserver): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  notify(change: TaskChange): void {
    // Notify all observers
    this.observers.forEach(observer => {
      try {
        observer.update(change);
      } catch (e) {
        console.error('Observer update failed', e);
      }
    });
  }

  // Helper for testing
  getObserverCount(): number {
    return this.observers.length;
  }
}

export const observerService = new ObserverService();
