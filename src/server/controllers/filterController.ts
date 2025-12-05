
import { ApiResponse, FilterQuery, FilterPreset, Task } from '../../shared/types/task.types';
import { filterService } from '../services/filterService';
import { taskService } from '../services/taskService';
import { delay } from '../../shared/utils/helpers';

const _response = <T>(success: boolean, data?: T, error?: string, statusCode: number = 200): ApiResponse<T> => ({
    success, data, error, statusCode, meta: { timestamp: Date.now(), requestId: crypto.randomUUID() }
});

export const FilterController = {
    async executeQuery(query: FilterQuery): Promise<ApiResponse<Task[]>> {
        await delay(300);
        try {
            const allTasks = taskService.getAll();
            const results = filterService.executeQuery(allTasks, query);
            return _response(true, results);
        } catch (e) {
            return _response(false, undefined, "Filter execution failed", 500);
        }
    },
    async getPresets(): Promise<ApiResponse<FilterPreset[]>> {
        await delay(100);
        return _response(true, filterService.getPresets());
    },
    async savePreset(name: string, query: FilterQuery): Promise<ApiResponse<FilterPreset>> {
        await delay(200);
        try {
            const preset = filterService.savePreset(name, query);
            return _response(true, preset, undefined, 201);
        } catch (e) {
            return _response(false, undefined, "Save failed", 500);
        }
    },
    async deletePreset(id: string): Promise<ApiResponse<null>> {
        await delay(200);
        if (filterService.deletePreset(id)) return _response(true, null);
        return _response(false, undefined, "Not found", 404);
    }
};
