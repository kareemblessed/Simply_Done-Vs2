
import { ApiResponse, CreateReminderDTO, TaskReminder } from '../../shared/types/task.types';
import { reminderService } from '../services/reminderService';
import { delay } from '../../shared/utils/helpers';

const _response = <T>(success: boolean, data?: T, error?: string, statusCode: number = 200): ApiResponse<T> => ({
    success, data, error, statusCode, meta: { timestamp: Date.now(), requestId: crypto.randomUUID() }
});

export const ReminderController = {
    async getReminders(): Promise<ApiResponse<TaskReminder[]>> {
        await delay(100);
        return _response(true, reminderService.getAll());
    },
    async createReminder(dto: CreateReminderDTO): Promise<ApiResponse<TaskReminder>> {
        await delay(200);
        try {
            const result = reminderService.create(dto);
            return _response(true, result, undefined, 201);
        } catch (e: any) {
            return _response(false, undefined, e.message, 400);
        }
    },
    async deleteReminder(id: string): Promise<ApiResponse<null>> {
        await delay(200);
        if (reminderService.delete(id)) return _response(true, null);
        return _response(false, undefined, "Not found", 404);
    }
};
