

// A key file

import { TaskReminder, ApiResponse, CreateReminderDTO } from '../../shared/types/task.types';
import { reminderService } from '../services/reminderService';
import { taskService } from '../services/taskService';
import { delay } from '../../shared/utils/helpers';

export const ReminderController = {
  
  _response<T>(success: boolean, data?: T, error?: string, statusCode: number = 200): ApiResponse<T> {
    return {
      success,
      data,
      error,
      statusCode,
      meta: { timestamp: Date.now(), requestId: crypto.randomUUID() }
    };
  },

  async getReminders(): Promise<ApiResponse<TaskReminder[]>> {
    try {
      const reminders = reminderService.getAll();
      return this._response(true, reminders);
    } catch (e) {
      return this._response(false, undefined, 'Failed to fetch reminders', 500);
    }
  },

  async createReminder(dto: CreateReminderDTO): Promise<ApiResponse<TaskReminder>> {
    await delay(200);
    try {
      const reminder = reminderService.create(dto);
      return this._response(true, reminder, undefined, 201);
    } catch (e: any) {
      return this._response(false, undefined, e.message || 'Reminder creation failed', 400);
    }
  },

  async deleteReminder(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    try {
      taskService.removeReminderGlobally(id);
      const success = reminderService.delete(id);
      if (!success) return this._response(false, undefined, 'Reminder not found', 404);
      return this._response(true, null);
    } catch (e) {
      return this._response(false, undefined, 'Delete reminder failed', 500);
    }
  }
};
