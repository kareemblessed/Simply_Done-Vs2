
// ============================================================================
// FILTER SERVICE LAYER
// Path: src/server/services/filterService.ts
// ============================================================================

import { Task, FilterQuery, FilterCondition, FilterOperator, FilterPreset } from '../../shared/types/task.types';
import { db } from '../db/jsonDatabase';

class FilterService {
  
  /**
   * Constructs a valid query object ensuring all fields are present
   */
  buildQuery(conditions: FilterCondition[], logic: 'AND' | 'OR'): FilterQuery {
    return {
      conditions,
      logic
    };
  }

  /**
   * Executes the query against a list of tasks
   */
  executeQuery(tasks: Task[], query: FilterQuery): Task[] {
    if (!query.conditions || query.conditions.length === 0) {
      return tasks;
    }

    return tasks.filter(task => {
      // Evaluate all conditions
      const results = query.conditions.map(condition => this.evaluateCondition(task, condition));

      if (query.logic === 'AND') {
        return results.every(r => r === true);
      } else {
        return results.some(r => r === true);
      }
    });
  }

  /**
   * Evaluates a single condition against a task
   */
  private evaluateCondition(task: Task, condition: FilterCondition): boolean {
    const { field, operator, value } = condition;
    
    // Handle special "tag" field check
    if (field === 'tag') {
        if (operator === FilterOperator.CONTAINS || operator === FilterOperator.EQUALS) {
             return task.tags && task.tags.some(t => t.name.toLowerCase() === String(value).toLowerCase());
        }
        return false;
    }

    // Standard fields
    const taskValue = task[field as keyof Task];

    // Handle undefined/null values safely
    if (taskValue === undefined || taskValue === null) return false;

    switch (operator) {
      case FilterOperator.EQUALS:
        return String(taskValue).toLowerCase() === String(value).toLowerCase();
      
      case FilterOperator.NOT_EQUALS:
        return String(taskValue).toLowerCase() !== String(value).toLowerCase();
      
      case FilterOperator.CONTAINS:
        return String(taskValue).toLowerCase().includes(String(value).toLowerCase());
      
      case FilterOperator.GREATER_THAN:
        return Number(taskValue) > Number(value);
      
      case FilterOperator.LESS_THAN:
        return Number(taskValue) < Number(value);
      
      default:
        return false;
    }
  }

  // --- Preset Management ---

  getPresets(): FilterPreset[] {
    return db.readPresets();
  }

  savePreset(name: string, query: FilterQuery): FilterPreset {
    const presets = db.readPresets();
    const newPreset: FilterPreset = {
      id: crypto.randomUUID(),
      name,
      query
    };
    presets.push(newPreset);
    db.writePresets(presets);
    return newPreset;
  }

  deletePreset(id: string): boolean {
    const presets = db.readPresets();
    const filtered = presets.filter(p => p.id !== id);
    if (filtered.length === presets.length) return false;
    db.writePresets(filtered);
    return true;
  }
}

export const filterService = new FilterService();
