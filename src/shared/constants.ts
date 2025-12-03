
// ============================================================================
// CONSTANTS
// Path: src/shared/constants.ts
// ============================================================================

export const APP_NAME = "SimplyDone";
export const APP_VERSION = "2.1.0";

// Database Configuration
export const DB_KEYS = {
  TASKS: 'simplydone_tasks_v3',
  LOGS: 'simplydone_logs_v3',
};

// Validation Constraints
export const VALIDATION = {
  MAX_TITLE_LENGTH: 100,
  MAX_DESC_LENGTH: 500,
};

// UI Colors (Shared reference for consistency)
export const PRIORITY_COLORS = {
  HIGH: 'text-red-600 bg-red-50 border-red-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  LOW: 'text-blue-600 bg-blue-50 border-blue-200',
};
