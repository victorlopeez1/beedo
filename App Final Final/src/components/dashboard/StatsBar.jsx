import { Flame, Star, Clock, Zap } from 'lucide-react';
import NeonCard from '../ui/NeonCard';

const stats = [
  { icon: Flame, label: 'Racha', value: '7 días', color: 'text-orange-400', glow: 'pink' },
  { icon: Star, label: 'XP Total', value: '2,450', color: 'text-neon-yellow', glow: 'purple' },
  { icon: Clock, label: 'Horas', value: '24h', color: 'text-neon-cyan', glow: 'cyan' },
  { icon: Zap, label: 'Precisión', value: '87%', color: 'text-neon-green', glow: 'green' },
];

export default function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color, glow }) => (
        <NeonCard key={label} glow={glow} className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-lg font-bold font-orbitron ${color}`}>{value}</p>
            </div>
          </div>
        </NeonCard>
      ))}
    </div>
  );
}