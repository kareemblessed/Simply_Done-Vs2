
// ============================================================================
// CONTROLLER LAYER - REMINDERS
// Path: src/server/controllers/reminderController.ts
// ============================================================================

import { ApiResponse, Task } from '../../shared/types/task.types';
import { taskService } from '../services/taskService';
import { delay } from '../../shared/utils/helpers';
import { nanoid } from 'nanoid';

export const ReminderController = {

  _response<T>(success: boolean, data?: T, error?: string, statusCode: number = 200): ApiResponse<T> {
    return {
      success,
      data,
      error,
      statusCode,
      meta: {
        timestamp: Date.now(),
        requestId: nanoid()
      }
    };
  },

  async addReminder(taskId: string, time: number, message: string): Promise<ApiResponse<Task>> {
    await delay(200);

    if (time <= Date.now()) {
      return this._response(false, undefined, 'Cannot set reminder in the past', 400);
    }

    try {
      const task = taskService.addReminderToTask(taskId, time, message);
      if (!task) return this._response(false, undefined, 'Task not found', 404);
      return this._response(true, task);
    } catch (e) {
      return this._response(false, undefined, 'Failed to add reminder', 500);
    }
  },

  async deleteReminder(taskId: string, reminderId: string): Promise<ApiResponse<Task>> {
    await delay(200);
    try {
      const task = taskService.removeReminderFromTask(taskId, reminderId);
      if (!task) return this._response(false, undefined, 'Task not found', 404);
      return this._response(true, task);
    } catch (e) {
      return this._response(false, undefined, 'Failed to delete reminder', 500);
    }
  }
};
