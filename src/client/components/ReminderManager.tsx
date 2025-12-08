
import React, { useState } from 'react';
import { TaskReminder } from '../../shared/types/task.types';
import { formatTime, formatDate } from '../../shared/utils/helpers';

interface ReminderManagerProps {
  reminders: TaskReminder[];
  onAdd: (time: number, message: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ReminderManager: React.FC<ReminderManagerProps> = ({ reminders, onAdd, onDelete }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;

    const timestamp = new Date(`${date}T${time}`).getTime();
    if (isNaN(timestamp)) return;

    try {
      await onAdd(timestamp, message);
      setDate('');
      setTime('');
      setMessage('');
      setIsAdding(false);
    } catch (err) {
      // Error handled by parent usually
    }
  };

  // Get current date/time for min attribute
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return (
    <div className="mt-3">
      <div className="space-y-2 mb-2">
        {reminders.map(reminder => (
          <div key={reminder.id} className="flex items-center justify-between bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-100 p-1.5 rounded-full text-indigo-600">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">
                  {formatDate(reminder.time)} at {formatTime(reminder.time)}
                </p>
                {reminder.message && <p className="text-[10px] text-slate-500">{reminder.message}</p>}
              </div>
            </div>
            <button 
              onClick={() => onDelete(reminder.id)}
              className="text-slate-400 hover:text-red-500 p-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-3 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="grid grid-cols-2 gap-2 mb-2">
             <input 
               type="date" 
               value={date} 
               min={todayStr}
               onChange={e => setDate(e.target.value)}
               className="text-xs border rounded p-1.5 w-full"
               required 
             />
             <input 
               type="time" 
               value={time}
               onChange={e => setTime(e.target.value)}
               className="text-xs border rounded p-1.5 w-full"
               required
             />
           </div>
           <input 
             type="text" 
             value={message}
             onChange={e => setMessage(e.target.value)}
             placeholder="Message (optional)"
             className="text-xs border rounded p-1.5 w-full mb-2"
           />
           <div className="flex gap-2">
             <button type="submit" className="flex-1 bg-indigo-600 text-white text-xs font-bold py-1.5 rounded hover:bg-indigo-700">Save Reminder</button>
             <button type="button" onClick={() => setIsAdding(false)} className="px-3 bg-white border border-slate-300 text-slate-600 text-xs font-bold py-1.5 rounded hover:bg-slate-50">Cancel</button>
           </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          className="text-[10px] font-bold text-indigo-500 hover:text-indigo-700 hover:underline flex items-center gap-1"
        >
          + Add reminder
        </button>
      )}
    </div>
  );
};
