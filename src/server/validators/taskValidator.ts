
// ============================================================================
// VALIDATOR LAYER
// Path: src/server/validators/taskValidator.ts
// ============================================================================

import { CreateTaskDTO, UpdateTaskDTO, Priority } from '../../shared/types/task.types';
import { VALIDATION } from '../../shared/constants';

export const TaskValidator = {
  
  /**
   * Validates the payload for creating a new task
   */
  validateCreate(dto: CreateTaskDTO): string | null {
    if (!dto.text || dto.text.trim().length === 0) {
      return 'Task text is required';
    }
    
    if (dto.text.length > VALIDATION.MAX_TITLE_LENGTH) {
      return `Task text cannot exceed ${VALIDATION.MAX_TITLE_LENGTH} characters`;
    }
    
    if (dto.description && dto.description.length > VALIDATION.MAX_DESC_LENGTH) {
      return `Description cannot exceed ${VALIDATION.MAX_DESC_LENGTH} characters`;
    }
    
    if (!Object.values(Priority).includes(dto.priority)) {
      return 'Invalid priority level provided';
    }
    
    return null;
  },

  /**
   * Validates the payload for updating a task
   */
  validateUpdate(dto: UpdateTaskDTO): string | null {
    if (dto.text !== undefined && dto.text.trim().length === 0) {
      return 'Task text cannot be empty';
    }
    
    if (dto.text && dto.text.length > VALIDATION.MAX_TITLE_LENGTH) {
      return `Task text cannot exceed ${VALIDATION.MAX_TITLE_LENGTH} characters`;
    }

    if (dto.description && dto.description.length > VALIDATION.MAX_DESC_LENGTH) {
      return `Description cannot exceed ${VALIDATION.MAX_DESC_LENGTH} characters`;
    }
    
    return null;
  }
};
