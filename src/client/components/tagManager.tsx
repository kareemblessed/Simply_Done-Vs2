
import React, { useState } from 'react';
import { TaskTag } from '../../shared/types/task.types';

interface TagManagerProps {
  tags: TaskTag[];
  onCreateTag: (name: string, color: string) => Promise<void>;
  onDeleteTag: (id: string) => Promise<void>;
}

const COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#64748b', // Slate
];

export const TagManager: React.FC<TagManagerProps> = ({ tags, onCreateTag, onDeleteTag }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[5]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateTag(tagName, selectedColor);
      setTagName('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-8">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest mb-4"
      >
        <span>{isExpanded ? 'Hide Tags' : 'Manage Tags'}</span>
        <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white shadow-sm mb-4">
          
          {/* Existing Tags List */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.length === 0 && <span className="text-xs text-slate-400 italic">No tags created yet.</span>}
            {tags.map(tag => (
              <div key={tag.id} className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-lg bg-white border border-slate-200 shadow-sm">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></span>
                <span className="text-xs font-medium text-slate-700">{tag.name}</span>
                <button 
                  onClick={() => onDeleteTag(tag.id)}
                  className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Create Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-slate-50/50 p-2 rounded-xl">
             <input
               type="text"
               value={tagName}
               onChange={(e) => setTagName(e.target.value)}
               placeholder="New tag name..."
               className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
             />
             <div className="flex gap-1">
               {COLORS.map(c => (
                 <button
                   key={c}
                   type="button"
                   onClick={() => setSelectedColor(c)}
                   className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedColor === c ? 'border-indigo-500 scale-110' : 'border-transparent hover:scale-110'}`}
                   style={{ backgroundColor: c }}
                 />
               ))}
             </div>
             <button 
               type="submit"
               disabled={!tagName.trim() || isSubmitting}
               className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
               Add
             </button>
          </form>
        </div>
      </div>
    </div>
  );
};
