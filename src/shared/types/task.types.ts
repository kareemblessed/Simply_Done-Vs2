
// ============================================================================
// SHARED TYPES
// Path: src/shared/types/task.types.ts
// ============================================================================

/**
 * Priority levels for tasks.
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

/**
 * Sort options available for the task list.
 */
export enum SortOption {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  PRIORITY_DESC = 'PRIORITY_DESC',
  PRIORITY_ASC = 'PRIORITY_ASC',
}

/**
 * The core Task object.
 */
export interface Task {
  id: string;
  text: string;
  description?: string;
  isCompleted: boolean;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

/**
 * Statistics summary for the dashboard.
 */
export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  highPriority: number;
  completionRate: number;
}

/**
 * Standard API Response wrapper.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
  meta?: {
    timestamp: number;
    requestId: string;
  };
}

/**
 * Input DTO for creating a task.
 */
export interface CreateTaskDTO {
  text: string;
  priority: Priority;
  description?: string;
}

/**
 * Input DTO for updating a task.
 */
export interface UpdateTaskDTO {
  text?: string;
  isCompleted?: boolean;
  priority?: Priority;
  description?: string;
}

/**
 * Log entry for the backend logger.
 */
export interface SystemLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: number;
  context?: any;
}
