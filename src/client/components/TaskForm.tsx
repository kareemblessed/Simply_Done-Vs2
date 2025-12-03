
import React, { useState } from 'react';
import { Priority } from '../../shared/types/task.types';

interface TaskFormProps {
  onAdd: (text: string, priority: Priority, desc?: string) => Promise<void>;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(text, priority, description);
      setText('');
      setDescription('');
      setPriority(Priority.MEDIUM);
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-10 bg-white p-2 rounded-3xl shadow-xl shadow-indigo-100/50 border border-indigo-50 relative z-10">
      <div className="flex flex-col gap-2">
        {/* Main Input */}
        <div className="relative group">
          <input
            type="text"
            value={text}
            onFocus={() => setIsExpanded(true)}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's your focus today?"
            className="w-full pl-6 pr-4 py-4 bg-transparent text-lg text-slate-800 placeholder:text-slate-400 focus:outline-none rounded-2xl transition-colors"
          />
          <div className="absolute bottom-2 left-6 right-6 h-px bg-slate-100 group-focus-within:bg-indigo-100 transition-colors" />
        </div>

        {/* Expanded Options */}
        <div className={`overflow-hidden transition-all duration-500 ease-in-out px-6 ${
          isExpanded ? 'max-h-56 opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'
        }`}>
          <div className="space-y-5 pt-2">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, context, or notes (optional)..."
              className="w-full text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none bg-slate-50 p-3 rounded-xl"
            />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                {Object.values(Priority).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      priority === p
                        ? 'bg-white text-indigo-600 shadow-md transform scale-105'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={!text.trim() || isSubmitting}
                className={`w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold tracking-wide text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                  !text.trim() || isSubmitting
                    ? 'bg-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-indigo-300 hover:from-indigo-500 hover:to-violet-500'
                }`}
              >
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
