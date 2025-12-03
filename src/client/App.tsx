
import React, { useEffect, useState, useMemo } from 'react';
import { Task, Priority, TaskStats, SortOption } from '../shared/types/task.types';
import { getPriorityWeight } from '../shared/utils/helpers';
import { apiService } from './services/apiService';
import { TaskForm } from './components/TaskForm';
import { FilterBar } from './components/FilterBar';
import { StatsCard } from './components/StatsCard';
import { TaskList } from './components/TaskList';

const App: React.FC = () => {
  // --- State ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [sort, setSort] = useState<SortOption>(SortOption.NEWEST);

  // --- Actions ---
  const refreshData = async () => {
    try {
      setLoading(true);
      const [fetchedTasks, fetchedStats] = await Promise.all([
        apiService.fetchTasks(),
        apiService.getStats()
      ]);
      setTasks(fetchedTasks);
      setStats(fetchedStats);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateStats = async () => {
    try {
      const newStats = await apiService.getStats();
      setStats(newStats);
    } catch (e) { console.error(e); }
  };

  const handleAddTask = async (text: string, priority: Priority, desc?: string) => {
    try {
      const newTask = await apiService.createTask(text, priority, desc);
      setTasks(prev => [newTask, ...prev]);
      await updateStats();
    } catch (err: any) { alert(err.message); }
  };

  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !currentStatus } : t));
    try {
      await apiService.toggleTask(id, currentStatus);
      await updateStats();
    } catch (err: any) { refreshData(); alert(err.message); }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    const old = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await apiService.deleteTask(id);
      await updateStats();
    } catch (err: any) { setTasks(old); alert(err.message); }
  };

  const handleClearCompleted = async () => {
    if (!confirm('Clear all completed tasks?')) return;
    try {
      await apiService.clearCompleted();
      setTasks(prev => prev.filter(t => !t.isCompleted));
      await updateStats();
    } catch (err: any) { alert(err.message); }
  };

  // --- Logic ---
  const processedTasks = useMemo(() => {
    let result = [...tasks];
    if (filter === 'ACTIVE') result = result.filter(t => !t.isCompleted);
    else if (filter === 'COMPLETED') result = result.filter(t => t.isCompleted);

    result.sort((a, b) => {
      switch (sort) {
        case SortOption.NEWEST: return b.createdAt - a.createdAt;
        case SortOption.OLDEST: return a.createdAt - b.createdAt;
        case SortOption.PRIORITY_DESC: return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        case SortOption.PRIORITY_ASC: return getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
        default: return 0;
      }
    });
    return result;
  }, [tasks, filter, sort]);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-900 relative">
      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black tracking-tighter text-slate-800 mb-3 drop-shadow-sm">
            Simply<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Done</span>.
          </h1>
          <p className="text-lg text-slate-500 font-medium tracking-wide">
            Clarify your mind. Organize your life.
          </p>
        </div>

        {/* Stats */}
        {!loading && !error && <StatsCard stats={stats} />}

        {/* Form */}
        <TaskForm onAdd={handleAddTask} />

        {/* Main List Area */}
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 border border-white">
          <FilterBar 
            currentFilter={filter}
            currentSort={sort}
            onFilterChange={setFilter}
            onSortChange={setSort}
            onClearCompleted={handleClearCompleted}
            hasCompleted={tasks.some(t => t.isCompleted)}
          />

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 flex items-center gap-3">
              <span className="font-bold">Error:</span> {error}
              <button onClick={refreshData} className="ml-auto underline hover:text-red-900 font-medium">Retry</button>
            </div>
          )}

          <TaskList 
            tasks={processedTasks}
            loading={loading}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            emptyMessage={
              filter === 'ALL' ? "Your list is empty. Add a task above to get started!" 
              : filter === 'ACTIVE' ? "You're all caught up! Great job." 
              : "Finish some tasks to see them here."
            }
          />
        </div>

        <div className="mt-12 text-center opacity-60">
           <p className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase">
             v2.1 • LocalStorage Database • Secure
           </p>
        </div>
      </div>
    </div>
  );
};

export default App;
