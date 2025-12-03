
// ============================================================================
// HELPERS
// Path: src/shared/utils/helpers.ts
// ============================================================================

import { Priority } from '../types/task.types';

/**
 * formatted Date string from timestamp
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * formatted Time string from timestamp
 */
export const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate a sort weight for priorities
 */
export const getPriorityWeight = (p: Priority): number => {
  switch (p) {
    case Priority.HIGH: return 3;
    case Priority.MEDIUM: return 2;
    case Priority.LOW: return 1;
    default: return 0;
  }
};

/**
 * Simple delay to simulate network latency
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
