
// ============================================================================
// API SERVICE
// Path: src/client/services/apiService.ts
// ============================================================================

import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStats, Priority } from '../../shared/types/task.types';
import { TaskController } from '../../server/index';

/**
 * Handles communication between Frontend components and the Backend Controller.
 */
export const apiService = {
  
  async fetchTasks(): Promise<Task[]> {
    const response = await TaskController.getTasks();
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data;
  },

  async createTask(text: string, priority: Priority, description?: string): Promise<Task> {
    const payload: CreateTaskDTO = { text, priority, description };
    const response = await TaskController.createTask(payload);
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data;
  },

  async toggleTask(id: string, currentStatus: boolean): Promise<Task> {
    const payload: UpdateTaskDTO = { isCompleted: !currentStatus };
    const response = await TaskController.updateTask(id, payload);
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    const response = await TaskController.deleteTask(id);
    if (!response.success) throw new Error(response.error);
  },

  async clearCompleted(): Promise<number> {
    const response = await TaskController.clearCompleted();
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data.count;
  },

  async getStats(): Promise<TaskStats> {
    const response = await TaskController.getStats();
    if (!response.success || !response.data) throw new Error(response.error);
    return response.data;
  }
};
