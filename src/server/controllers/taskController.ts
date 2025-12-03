
// ============================================================================
// CONTROLLER LAYER
// Path: src/server/controllers/taskController.ts
// ============================================================================

import { Task, ApiResponse, CreateTaskDTO, UpdateTaskDTO, TaskStats } from '../../shared/types/task.types';
import { TaskValidator } from '../validators/taskValidator';
import { taskService } from '../services/taskService';
import { delay } from '../../shared/utils/helpers';

export const TaskController = {
  
  _response<T>(success: boolean, data?: T, error?: string, statusCode: number = 200): ApiResponse<T> {
    return {
      success,
      data,
      error,
      statusCode,
      meta: {
        timestamp: Date.now(),
        requestId: crypto.randomUUID()
      }
    };
  },

  async getTasks(): Promise<ApiResponse<Task[]>> {
    await delay(300); // Simulate network
    try {
      const tasks = taskService.getAll();
      return this._response(true, tasks);
    } catch (e) {
      return this._response(false, undefined, 'Internal Server Error', 500);
    }
  },

  async createTask(dto: CreateTaskDTO): Promise<ApiResponse<Task>> {
    await delay(300);
    
    const error = TaskValidator.validateCreate(dto);
    if (error) return this._response(false, undefined, error, 400);

    try {
      const task = taskService.create(dto);
      return this._response(true, task, undefined, 201);
    } catch (e) {
      return this._response(false, undefined, 'Creation failed', 500);
    }
  },

  async updateTask(id: string, dto: UpdateTaskDTO): Promise<ApiResponse<Task>> {
    await delay(200);

    const error = TaskValidator.validateUpdate(dto);
    if (error) return this._response(false, undefined, error, 400);

    try {
      const task = taskService.update(id, dto);
      if (!task) return this._response(false, undefined, 'Task not found', 404);
      return this._response(true, task);
    } catch (e) {
      return this._response(false, undefined, 'Update failed', 500);
    }
  },

  async deleteTask(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    try {
      const success = taskService.delete(id);
      if (!success) return this._response(false, undefined, 'Task not found', 404);
      return this._response(true, null, undefined, 204);
    } catch (e) {
      return this._response(false, undefined, 'Delete failed', 500);
    }
  },

  async clearCompleted(): Promise<ApiResponse<{ count: number }>> {
    await delay(400);
    try {
      const count = taskService.clearCompleted();
      return this._response(true, { count });
    } catch (e) {
      return this._response(false, undefined, 'Clear failed', 500);
    }
  },

  async getStats(): Promise<ApiResponse<TaskStats>> {
    // Stats usually fast
    try {
      const stats = taskService.getStats();
      return this._response(true, stats);
    } catch (e) {
      return this._response(false, undefined, 'Stats failed', 500);
    }
  }
};
