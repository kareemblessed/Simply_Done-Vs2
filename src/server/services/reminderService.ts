
// ============================================================================
// SERVICE LAYER - REMINDERS
// Path: src/server/services/reminderService.ts
// ============================================================================

import { TaskReminder } from '../../shared/types/task.types';
import { taskService } from './taskService';
import { nanoid } from 'nanoid';

class ReminderService {
  
  /**
   * Creates a reminder object. Note: Does not attach to task automatically.
   */
  async createReminder(time: number, message: string): Promise<TaskReminder> {
    if (time <= Date.now()) {
      throw new Error("Reminder time must be in the future");
    }
    
    return {
      id: nanoid(),
      time,
      message: message.trim() || 'Reminder'
    };
  }

  /**
   * Retrieves all reminders for a specific task
   */
  async getRemindersForTask(taskId: string): Promise<TaskReminder[]> {
    const task = taskService.getById(taskId);
    return task ? (task.reminders || []) : [];
  }

  /**
   * Deletes a reminder from a task
   */
  async deleteReminder(taskId: string, reminderId: string): Promise<boolean> {
    const updatedTask = await taskService.removeReminderFromTask(taskId, reminderId);
    return !!updatedTask;
  }
}

export const reminderService = new ReminderService();
