
import React, { useState } from 'react';
import { TaskReminder } from '../../shared/types/task.types';
import { formatTime, formatDate } from '../../shared/utils/helpers';

interface ReminderManagerProps {
  reminders: TaskReminder[];
  onCreateReminder: (time: number, message: string) => Promise<void>;
  onDeleteReminder: (id: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({ reminders, onCreateReminder, onDeleteReminder, isOpen, onClose }) => {
  const [message, setMessage] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !dateTime) return;

    setIsSubmitting(true);
    try {
      const timestamp = new Date(dateTime).getTime();
      await onCreateReminder(timestamp, message);
      setMessage('');
      setDateTime('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800">Manage Reminders</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Reminder message..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium"
            />
            
            <input 
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium text-slate-600"
            />

            <button
              type="submit"
              disabled={!message.trim() || !dateTime || isSubmitting}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {isSubmitting ? 'Adding...' : 'Add Reminder'}
            </button>
          </form>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {reminders.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-4">No reminders set.</p>
            ) : (
              reminders.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700">{r.message}</span>
                    <span className="text-xs text-slate-500">{formatDate(r.time)} at {formatTime(r.time)}</span>
                  </div>
                  <button
                    onClick={() => onDeleteReminder(r.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
