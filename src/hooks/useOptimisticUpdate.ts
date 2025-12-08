import { useState, useMemo, useEffect } from 'react';
import { Task } from '../shared/types/task.types';
import { OptimisticUpdate, OptimisticStateManager } from '../utils/optimisticStateManager';
import { nanoid } from 'nanoid';

export const useOptimisticUpdate = (initialTasks: Task[]) => {
    // We maintain the "server state" (authoritative) and "pending updates" (optimistic)
    const [serverTasks, setServerTasks] = useState<Task[]>(initialTasks);
    const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate[]>([]);

    // Update server state when prop changes
    useEffect(() => {
        setServerTasks(initialTasks);
    }, [initialTasks]);

    // Derived state: Application of pending updates onto server state
    const optimisticTasks = useMemo(() => {
        return OptimisticStateManager.applyUpdates(serverTasks, pendingUpdates);
    }, [serverTasks, pendingUpdates]);

    const addOptimistic = (taskId: string, type: 'CREATE'|'UPDATE'|'DELETE', payload: any) => {
        const opId = nanoid();
        const update: OptimisticUpdate = {
            id: opId,
            taskId,
            type,
            payload,
            optimistic: true,
            pending: true,
            timestamp: Date.now()
        };
        setPendingUpdates(prev => [...prev, update]);
        return opId;
    };

    const removeOptimistic = (opId: string) => {
        setPendingUpdates(prev => prev.filter(u => u.id !== opId));
    };

    const isPending = (taskId: string) => {
        return OptimisticStateManager.isTaskPending(taskId, pendingUpdates);
    };

    return {
        tasks: optimisticTasks,
        setServerTasks,
        addOptimistic,
        removeOptimistic,
        isPending
    };
};