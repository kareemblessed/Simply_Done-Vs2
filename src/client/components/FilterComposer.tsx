
import React, { useState, useEffect } from 'react';
import { FilterQuery, FilterCondition, FilterOperator, FilterPreset, Priority } from '../../shared/types/task.types';

interface FilterComposerProps {
  onApply: (query: FilterQuery) => void;
  onSavePreset: (name: string, query: FilterQuery) => Promise<void>;
  presets: FilterPreset[];
  onLoadPreset: (preset: FilterPreset) => void;
  onDeletePreset: (id: string) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export const FilterComposer: React.FC<FilterComposerProps> = ({ 
  onApply, onSavePreset, presets, onLoadPreset, onDeletePreset, isOpen, onClose 
}) => {
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSave, setShowSave] = useState(false);

  // Add a default condition if empty
  useEffect(() => {
    if (isOpen && conditions.length === 0) {
      addCondition();
    }
  }, [isOpen]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: crypto.randomUUID(), field: 'text', operator: FilterOperator.CONTAINS, value: '' }
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleApply = () => {
    onApply({ logic, conditions });
    onClose();
  };

  const handleSave = async () => {
    if (!presetName.trim()) return;
    await onSavePreset(presetName, { logic, conditions });
    setPresetName('');
    setShowSave(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold text-slate-800">Advanced Filters</h2>
             {presets.length > 0 && (
               <div className="relative group">
                 <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors">
                   Load Preset ▼
                 </button>
                 <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 hidden group-hover:block z-10 overflow-hidden">
                   {presets.map(p => (
                     <div key={p.id} className="flex justify-between items-center px-4 py-2 hover:bg-slate-50">
                       <button 
                         onClick={() => {
                           setLogic(p.query.logic);
                           setConditions(p.query.conditions);
                           onLoadPreset(p);
                         }}
                         className="text-sm font-medium text-slate-700 text-left flex-1"
                       >
                         {p.name}
                       </button>
                       <button onClick={() => onDeletePreset(p.id)} className="text-slate-400 hover:text-red-500">×</button>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Logic Toggle */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <span className="text-sm font-bold text-slate-500 mr-3 uppercase tracking-wide">Match:</span>
          <div className="inline-flex bg-slate-100 rounded-lg p-1">
            {(['AND', 'OR'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLogic(l)}
                className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${
                  logic === l ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {l === 'AND' ? 'All (AND)' : 'Any (OR)'}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/30">
          {conditions.map((condition, index) => (
            <div key={condition.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
              
              <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full border border-indigo-200 z-10">
                {index + 1}
              </span>

              {/* Field Selector */}
              <select 
                value={condition.field}
                onChange={(e) => updateCondition(condition.id, { field: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                <option value="text">Task Name</option>
                <option value="description">Description</option>
                <option value="priority">Priority</option>
                <option value="isCompleted">Status</option>
                <option value="tag">Tag Name</option>
              </select>

              {/* Operator Selector */}
              <select 
                value={condition.operator}
                onChange={(e) => updateCondition(condition.id, { operator: e.target.value as any })}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
              >
                <option value={FilterOperator.EQUALS}>Equals</option>
                <option value={FilterOperator.NOT_EQUALS}>Not Equals</option>
                <option value={FilterOperator.CONTAINS}>Contains</option>
                <option value={FilterOperator.GREATER_THAN}>Greater Than</option>
                <option value={FilterOperator.LESS_THAN}>Less Than</option>
              </select>

              {/* Value Input */}
              <div className="flex-1 w-full sm:w-auto">
                {condition.field === 'priority' ? (
                   <select
                     value={condition.value}
                     onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                     className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                   >
                     {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                ) : condition.field === 'isCompleted' ? (
                    <select
                     value={String(condition.value)}
                     onChange={(e) => updateCondition(condition.id, { value: e.target.value === 'true' })}
                     className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                   >
                     <option value="true">Completed</option>
                     <option value="false">Active</option>
                   </select>
                ) : (
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    placeholder="Value..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                )}
              </div>

              <button 
                onClick={() => removeCondition(condition.id)}
                className="text-slate-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors ml-auto sm:ml-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}

          <button
            onClick={addCondition}
            className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold text-sm hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
          >
            + Add Condition
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
          <div className="flex gap-2 w-full sm:w-auto">
             {!showSave ? (
               <button 
                 onClick={() => setShowSave(true)}
                 disabled={conditions.length === 0}
                 className="px-4 py-2 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors"
               >
                 Save Preset
               </button>
             ) : (
               <div className="flex gap-2 animate-fade-in">
                 <input 
                   type="text" 
                   value={presetName}
                   onChange={(e) => setPresetName(e.target.value)}
                   placeholder="Preset name..."
                   className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
                 />
                 <button onClick={handleSave} className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">Save</button>
                 <button onClick={() => setShowSave(false)} className="px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-bold">Cancel</button>
               </div>
             )}
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-6 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
            <button 
              onClick={handleApply}
              disabled={conditions.length === 0}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
