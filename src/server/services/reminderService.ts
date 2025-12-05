
import { TaskReminder, CreateReminderDTO } from '../../shared/types/task.types';
import { db } from '../db/jsonDatabase';
import { VALIDATION } from '../../shared/constants';

class ReminderService {
  getAll(): TaskReminder[] { return db.readReminders(); }
  
  getById(id: string): TaskReminder | undefined { 
    return db.readReminders().find(r => r.id === id); 
  }

  create(dto: CreateReminderDTO): TaskReminder {
    const reminders = db.readReminders();
    if (!dto.message || dto.message.length > VALIDATION.MAX_REMINDER_MSG_LENGTH) {
        throw new Error("Invalid reminder message");
    }
    const newReminder: TaskReminder = {
        id: crypto.randomUUID(),
        time: dto.time,
        message: dto.message
    };
    reminders.push(newReminder);
    db.writeReminders(reminders);
    return newReminder;
  }

  delete(id: string): boolean {
    const reminders = db.readReminders();
    const filtered = reminders.filter(r => r.id !== id);
    if (filtered.length === reminders.length) return false;
    db.writeReminders(filtered);
    return true;
  }
}
export const reminderService = new ReminderService();
