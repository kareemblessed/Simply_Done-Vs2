
import React, { useState, useEffect } from 'react';
import { FilterQuery, FilterCondition, FilterLogic, FilterOperator, TaskField, Priority, FilterPreset } from '../../shared/types/task.types';
import { nanoid } from 'nanoid';
import { apiService } from '../services/apiService';

interface FilterComposerProps {
  onApply: (query: FilterQuery | null) => void;
  onClose: () => void;
}

export const FilterComposer: React.FC<FilterComposerProps> = ({ onApply, onClose }) => {
  const [logic, setLogic] = useState<FilterLogic>(FilterLogic.AND);
  const [conditions, setConditions] = useState<FilterCondition[]>([]);
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await apiService.getFilterPresets();
      setPresets(data);
    } catch (e) {
      console.error(e);
    }
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { id: nanoid(), field: 'text', operator: FilterOperator.CONTAINS, value: '' }
    ]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleApply = () => {
    if (conditions.length === 0) {
      onApply(null);
    } else {
      onApply({ logic, conditions });
    }
    onClose();
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) return;
    try {
      await apiService.saveFilterPreset(presetName, { logic, conditions });
      setPresetName('');
      setShowSave(false);
      loadPresets();
    } catch (e) {
      alert('Failed to save preset');
    }
  };

  const loadPreset = (preset: FilterPreset) => {
    setLogic(preset.query.logic);
    setConditions(preset.query.conditions);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-2xl border border-indigo-100 mb-8 animate-fade-in-down">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800">Advanced Filter</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6 flex items-center gap-3 bg-slate-50 p-3 rounded-xl">
        <span className="text-sm font-bold text-slate-600">Match</span>
        <select
          value={logic}
          onChange={(e) => setLogic(e.target.value as FilterLogic)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value={FilterLogic.AND}>ALL</option>
          <option value={FilterLogic.OR}>ANY</option>
        </select>
        <span className="text-sm font-bold text-slate-600">of the following conditions:</span>
      </div>

      <div className="space-y-3 mb-6">
        {conditions.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-4 italic">No conditions added yet.</p>
        )}
        
        {conditions.map((condition) => (
          <div key={condition.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
            {/* Field Selector */}
            <select
              value={condition.field}
              onChange={(e) => updateCondition(condition.id, { field: e.target.value as TaskField, value: '' })}
              className="flex-1 min-w-[120px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
            >
              <option value="text">Task Name</option>
              <option value="description">Description</option>
              <option value="priority">Priority</option>
              <option value="isCompleted">Status</option>
            </select>

            {/* Operator Selector */}
            <select
              value={condition.operator}
              onChange={(e) => updateCondition(condition.id, { operator: e.target.value as FilterOperator })}
              className="flex-1 min-w-[120px] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
            >
              <option value={FilterOperator.EQUALS}>Equals</option>
              <option value={FilterOperator.NOT_EQUALS}>Not Equals</option>
              {condition.field !== 'priority' && condition.field !== 'isCompleted' && (
                <>
                  <option value={FilterOperator.CONTAINS}>Contains</option>
                  <option value={FilterOperator.STARTS_WITH}>Starts With</option>
                  <option value={FilterOperator.ENDS_WITH}>Ends With</option>
                </>
              )}
            </select>

            {/* Value Input */}
            <div className="flex-[2] min-w-[150px]">
              {condition.field === 'priority' ? (
                 <select
                    value={String(condition.value)}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
                 >
                   <option value="">Select Priority...</option>
                   <option value={Priority.HIGH}>High</option>
                   <option value={Priority.MEDIUM}>Medium</option>
                   <option value={Priority.LOW}>Low</option>
                 </select>
              ) : condition.field === 'isCompleted' ? (
                <select
                    value={String(condition.value)}
                    onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
                 >
                   <option value="true">Completed</option>
                   <option value="false">Active</option>
                 </select>
              ) : (
                <input
                  type="text"
                  value={String(condition.value)}
                  onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                  placeholder="Value..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none"
                />
              )}
            </div>

            <button onClick={() => removeCondition(condition.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
        
        <button onClick={addCondition} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Condition
        </button>
      </div>

      {/* Preset Section */}
      <div className="border-t border-slate-100 pt-4 mb-6">
         <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved Presets</span>
            <button onClick={() => setShowSave(!showSave)} className="text-xs text-indigo-500 hover:underline">Save current as...</button>
         </div>
         
         {showSave && (
           <div className="flex gap-2 mb-3 animate-fade-in">
             <input 
               type="text" 
               value={presetName}
               onChange={e => setPresetName(e.target.value)}
               placeholder="Preset Name"
               className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5"
             />
             <button onClick={handleSavePreset} className="bg-indigo-600 text-white text-xs font-bold px-3 rounded-lg">Save</button>
           </div>
         )}

         <div className="flex flex-wrap gap-2">
           {presets.map(p => (
             <button 
               key={p.id}
               onClick={() => loadPreset(p)}
               className="bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs px-3 py-1.5 rounded-full transition-colors border border-transparent hover:border-indigo-200"
             >
               {p.name}
             </button>
           ))}
           {presets.length === 0 && <span className="text-xs text-slate-400">No presets saved</span>}
         </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Cancel</button>
        <button 
          onClick={handleApply}
          className="px-8 py-2 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};
