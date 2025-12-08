
import { FilterQuery, FilterCondition, FilterLogic, FilterOperator, Task, FilterPreset, TaskField } from '../../shared/types/task.types';
import { db } from '../db/jsonDatabase';
import { nanoid } from 'nanoid';

class FilterService {
  
  buildQuery(logic: FilterLogic, conditions: FilterCondition[]): FilterQuery {
    return { logic, conditions };
  }

  executeQuery(tasks: Task[], query: FilterQuery): Task[] {
    if (!query.conditions || query.conditions.length === 0) {
      return tasks;
    }

    return tasks.filter(task => {
      const results = query.conditions.map(condition => this.checkCondition(task, condition));
      
      if (query.logic === FilterLogic.AND) {
        return results.every(result => result === true);
      } else {
        return results.some(result => result === true);
      }
    });
  }

  private checkCondition(task: Task, condition: FilterCondition): boolean {
    const { field, operator, value } = condition;
    
    // Defensive check
    if (task[field] === undefined) return false;

    const taskVal = String(task[field]).toLowerCase();
    const conditionVal = String(value).toLowerCase();

    switch (operator) {
      case FilterOperator.EQUALS:
        return taskVal === conditionVal;
      case FilterOperator.NOT_EQUALS:
        return taskVal !== conditionVal;
      case FilterOperator.CONTAINS:
        return taskVal.includes(conditionVal);
      case FilterOperator.STARTS_WITH:
        return taskVal.startsWith(conditionVal);
      case FilterOperator.ENDS_WITH:
        return taskVal.endsWith(conditionVal);
      default:
        return false;
    }
  }

  savePreset(name: string, query: FilterQuery): FilterPreset {
    const presets = db.readPresets();
    const newPreset: FilterPreset = {
      id: nanoid(),
      name,
      query
    };
    presets.push(newPreset);
    db.writePresets(presets);
    return newPreset;
  }

  getPresets(): FilterPreset[] {
    return db.readPresets();
  }
}

export const filterService = new FilterService();
