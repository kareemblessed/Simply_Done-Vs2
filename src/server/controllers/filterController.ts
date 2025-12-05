
// ============================================================================
// FILTER CONTROLLER
// Path: src/server/controllers/filterController.ts
// ============================================================================

import { Task, ApiResponse, FilterQuery, FilterPreset } from '../../shared/types/task.types';
import { filterService } from '../services/filterService';
import { taskService } from '../services/taskService';
import { delay } from '../../shared/utils/helpers';

export const FilterController = {
  
  _response<T>(success: boolean, data?: T, error?: string, statusCode: number = 200): ApiResponse<T> {
    return {
      success,
      data,
      error,
      statusCode,
      meta: { timestamp: Date.now(), requestId: crypto.randomUUID() }
    };
  },

  async executeQuery(query: FilterQuery): Promise<ApiResponse<Task[]>> {
    try {
      // Simulate network latency for complex query
      await delay(150); 
      const filteredTasks = taskService.filterTasksByQuery(query);
      return this._response(true, filteredTasks);
    } catch (e) {
      return this._response(false, undefined, 'Query execution failed', 500);
    }
  },

  async getPresets(): Promise<ApiResponse<FilterPreset[]>> {
    try {
      const presets = filterService.getPresets();
      return this._response(true, presets);
    } catch (e) {
      return this._response(false, undefined, 'Failed to fetch presets', 500);
    }
  },

  async savePreset(name: string, query: FilterQuery): Promise<ApiResponse<FilterPreset>> {
    await delay(200);
    try {
      const preset = filterService.savePreset(name, query);
      return this._response(true, preset, undefined, 201);
    } catch (e) {
      return this._response(false, undefined, 'Failed to save preset', 500);
    }
  },

  async deletePreset(id: string): Promise<ApiResponse<null>> {
    await delay(200);
    try {
      const success = filterService.deletePreset(id);
      if (!success) return this._response(false, undefined, 'Preset not found', 404);
      return this._response(true, null);
    } catch (e) {
      return this._response(false, undefined, 'Failed to delete preset', 500);
    }
  }
};
