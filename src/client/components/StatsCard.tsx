
import React from 'react';
import { TaskStats } from '../../shared/types/task.types';

interface StatsCardProps {
  stats: TaskStats | null;
}

const StatItem = ({ label, value, colorClass }: { label: string, value: string | number, colorClass: string }) => (
  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/50 transform hover:scale-105 transition-all duration-300">
    <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
    <p className={`text-2xl font-black ${colorClass}`}>{value}</p>
  </div>
);

export const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatItem label="Total Tasks" value={stats.total} colorClass="text-slate-700" />
      <StatItem label="Active" value={stats.active} colorClass="text-indigo-600" />
      <StatItem label="Completed" value={stats.completed} colorClass="text-emerald-500" />
      <StatItem label="Efficiency" value={`${stats.completionRate}%`} colorClass="text-purple-600" />
    </div>
  );
};
