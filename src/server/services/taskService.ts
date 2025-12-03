
// ============================================================================
// SERVICE LAYER
// Path: src/server/services/taskService.ts
// ============================================================================

import { Task, CreateTaskDTO, UpdateTaskDTO, TaskStats, Priority, SystemLog } from '../../shared/types/task.types';
import { db } from '../db/jsonDatabase';

// Internal Logger Service
const Logger = {
  info: (msg: string, ctx?: any) => log('INFO', msg, ctx),
  warn: (msg: string, ctx?: any) => log('WARN', msg, ctx),
  error: (msg: string, ctx?: any) => log('ERROR', msg, ctx),
};

function log(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: any) {
  const entry: SystemLog = {
    id: crypto.randomUUID(),
    level,
    message,
    timestamp: Date.now(),
    context
  };
  db.writeLog(entry);
  if (level === 'ERROR') console.error(`[SERVER] ${message}`, context);
}

class TaskService {
  
  getAll(): Task[] {
    return db.readTasks();
  }

  getById(id: string): Task | undefined {
    return db.readTasks().find(t => t.id === id);
  }

  create(dto: CreateTaskDTO): Task {
    const tasks = db.readTasks();
    
    // Check for duplicate active tasks
    const isDuplicate = tasks.some(t => 
      !t.isCompleted && 
      t.text.toLowerCase() === dto.text.trim().toLowerCase()
    );

    if (isDuplicate) {
      Logger.warn('Creating duplicate task', { text: dto.text });
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: dto.text.trim(),
      description: dto.description?.trim(),
      priority: dto.priority,
      isCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    tasks.push(newTask);
    db.writeTasks(tasks);
    Logger.info('Task created', { id: newTask.id });
    
    return newTask;
  }

  update(id: string, dto: UpdateTaskDTO): Task | null {
    const tasks = db.readTasks();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index === -1) return null;

    const currentTask = tasks[index];
    
    // Handle completion timestamp logic
    let completedAt = currentTask.completedAt;
    if (dto.isCompleted === true && !currentTask.isCompleted) {
      completedAt = Date.now();
    } else if (dto.isCompleted === false) {
      completedAt = undefined;
    }

    const updatedTask: Task = {
      ...currentTask,
      ...dto,
      updatedAt: Date.now(),
      completedAt
    };

    tasks[index] = updatedTask;
    db.writeTasks(tasks);
    Logger.info('Task updated', { id, updates: Object.keys(dto) });
    
    return updatedTask;
  }

  delete(id: string): boolean {
    const tasks = db.readTasks();
    const filtered = tasks.filter(t => t.id !== id);
    
    if (filtered.length === tasks.length) return false;

    db.writeTasks(filtered);
    Logger.info('Task deleted', { id });
    return true;
  }

  clearCompleted(): number {
    const tasks = db.readTasks();
    const activeTasks = tasks.filter(t => !t.isCompleted);
    const countRemoved = tasks.length - activeTasks.length;
    
    if (countRemoved > 0) {
      db.writeTasks(activeTasks);
      Logger.info('Cleared completed tasks', { count: countRemoved });
    }
    
    return countRemoved;
  }

  getStats(): TaskStats {
    const tasks = db.readTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    
    return {
      total,
      active: total - completed,
      completed,
      highPriority: tasks.filter(t => t.priority === Priority.HIGH && !t.isCompleted).length,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
}

export const taskService = new TaskService();
