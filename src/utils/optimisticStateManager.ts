import { Task } from '../shared/types/task.types';

export interface OptimisticUpdate {
  id: string;        // Operation ID
  taskId: string;    // Target Task ID
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  payload?: any;     // The data being applied
  optimistic: boolean; // Always true for tracking
  pending: boolean;    // True while in flight
  timestamp: number;
}

export class OptimisticStateManager {
    // Pure logic to apply updates on a list of tasks
    static applyUpdates(baseTasks: Task[], updates: OptimisticUpdate[]): Task[] {
        let result = [...baseTasks];
        // Sort by timestamp to ensure order of application
        const sortedUpdates = [...updates].sort((a, b) => a.timestamp - b.timestamp);

        for (const update of sortedUpdates) {
            if (update.type === 'CREATE') {
                // For creates, we prepend the temporary task
                // Payload must contain the optimistic Task object
                if (update.payload) {
                    result.unshift({ ...update.payload, id: update.taskId });
                }
            } else if (update.type === 'UPDATE') {
                result = result.map(t => {
                    if (t.id === update.taskId) {
                        // Deep merge for subtasks if needed, or simple spread
                        return { ...t, ...update.payload };
                    }
                    return t;
                });
            } else if (update.type === 'DELETE') {
                result = result.filter(t => t.id !== update.taskId);
            }
        }
        return result;
    }

    static isTaskPending(taskId: string, updates: OptimisticUpdate[]): boolean {
        return updates.some(u => u.taskId === taskId && u.pending);
    }
}