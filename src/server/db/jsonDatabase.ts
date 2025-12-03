
// ============================================================================
// DATABASE LAYER
// Path: src/server/db/jsonDatabase.ts
// ============================================================================

import { Task, SystemLog } from '../../shared/types/task.types';
import { DB_KEYS } from '../../shared/constants';

class JsonDatabase {
  
  readTasks(): Task[] {
    try {
      const data = localStorage.getItem(DB_KEYS.TASKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("[DB] Read Error", e);
      return [];
    }
  }

  writeTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(DB_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error("[DB] Write Error", e);
    }
  }

  writeLog(log: SystemLog): void {
    try {
      const logs = this.readLogs();
      logs.push(log);
      // Limit logs to prevent localStorage quotas
      if (logs.length > 200) logs.shift();
      localStorage.setItem(DB_KEYS.LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error("[DB] Log Error", e);
    }
  }

  readLogs(): SystemLog[] {
    const data = localStorage.getItem(DB_KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  }
}

export const db = new JsonDatabase();
