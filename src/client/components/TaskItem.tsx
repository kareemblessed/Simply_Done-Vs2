
import React from 'react';
import { Task, Priority } from '../../shared/types/task.types';
import { formatDate, formatTime } from '../../shared/utils/helpers';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: boolean) => void;
  onDelete: (id: string) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    [Priority.HIGH]: 'bg-red-100 text-red-700 border-red-200',
    [Priority.MEDIUM]: 'bg-amber-100 text-amber-700 border-amber-200',
    [Priority.LOW]: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${colors[priority]}`}>
      {priority}
    </span>
  );
};

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  return (
    <div className={`group relative bg-white border rounded-2xl p-4 transition-all duration-300 ${
      task.isCompleted 
        ? 'opacity-60 border-slate-100 bg-slate-50' 
        : 'border-slate-200/60 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200'
    }`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id, task.isCompleted)}
          className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 ${
            task.isCompleted
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-transparent text-white scale-110'
              : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 text-transparent'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className={`text-base font-medium truncate pr-8 transition-colors ${
              task.isCompleted ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-800'
            }`}>
              {task.text}
            </h4>
            <PriorityBadge priority={task.priority} />
          </div>
          
          {task.description && (
            <p className={`text-sm mb-2 ${task.isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
            <span>{formatDate(task.createdAt)}</span>
            {task.isCompleted && task.completedAt && (
              <span className="text-emerald-600/70 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                Done at {formatTime(task.completedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Delete Action */}
        <button
          onClick={() => onDelete(task.id)}
          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
