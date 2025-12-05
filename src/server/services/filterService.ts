
import { Task, FilterQuery, FilterPreset, FilterOperator } from '../../shared/types/task.types';
import { db } from '../db/jsonDatabase';

class FilterService {
  executeQuery(tasks: Task[], query: FilterQuery): Task[] {
    return tasks.filter(task => {
        const results = query.conditions.map(condition => {
            let itemValue: any;
            if (condition.field === 'tag') {
                // Virtual field for tags
                return task.tags.some(t => {
                   if (condition.operator === FilterOperator.CONTAINS) return t.name.includes(condition.value);
                   return t.name === condition.value;
                });
            } else {
                itemValue = task[condition.field as keyof Task];
            }

            switch (condition.operator) {
                case FilterOperator.EQUALS: return itemValue === condition.value;
                case FilterOperator.NOT_EQUALS: return itemValue !== condition.value;
                case FilterOperator.CONTAINS: 
                    return typeof itemValue === 'string' && itemValue.toLowerCase().includes(String(condition.value).toLowerCase());
                case FilterOperator.GREATER_THAN: return itemValue > condition.value;
                case FilterOperator.LESS_THAN: return itemValue < condition.value;
                default: return false;
            }
        });

        if (query.logic === 'AND') return results.every(r => r);
        return results.some(r => r);
    });
  }

  buildQuery(conditions: any[], logic: 'AND' | 'OR'): FilterQuery {
      return { logic, conditions };
  }

  getPresets(): FilterPreset[] { return db.readPresets(); }

  savePreset(name: string, query: FilterQuery): FilterPreset {
      const presets = db.readPresets();
      const newPreset: FilterPreset = { id: crypto.randomUUID(), name, query };
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
