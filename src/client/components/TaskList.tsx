
import React from 'react';
import { Task } from '../../shared/types/task.types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string, s: boolean) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, loading, onToggle, onDelete, emptyMessage }) => {
  if (loading) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-slate-100/50 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-300 rounded-full mb-6 shadow-inner">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">So empty, so clean!</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
