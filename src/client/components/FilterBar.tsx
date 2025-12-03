
import React from 'react';
import { SortOption } from '../../shared/types/task.types';

interface FilterBarProps {
  currentFilter: 'ALL' | 'ACTIVE' | 'COMPLETED';
  currentSort: SortOption;
  onFilterChange: (f: 'ALL' | 'ACTIVE' | 'COMPLETED') => void;
  onSortChange: (s: SortOption) => void;
  onClearCompleted: () => void;
  hasCompleted: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({ 
  currentFilter, 
  currentSort, 
  onFilterChange, 
  onSortChange,
  onClearCompleted,
  hasCompleted
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
      <div className="flex bg-slate-100/80 p-1 rounded-xl backdrop-blur-sm">
        {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
              currentFilter === filter
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                : 'text-slate-500 hover:text-indigo-600 hover:bg-white/50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-xl px-4 py-2 pr-8 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <option value={SortOption.NEWEST}>Newest First</option>
            <option value={SortOption.OLDEST}>Oldest First</option>
            <option value={SortOption.PRIORITY_DESC}>Highest Priority</option>
            <option value={SortOption.PRIORITY_ASC}>Lowest Priority</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>

        {hasCompleted && (
          <button
            onClick={onClearCompleted}
            className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-500 px-4 py-2 rounded-xl transition-all duration-300 ml-auto sm:ml-0 border border-red-100 hover:border-red-500"
          >
            Clear Done
          </button>
        )}
      </div>
    </div>
  );
};
