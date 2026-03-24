import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Star, Flame, Clock, Music, Zap, Lock } from 'lucide-react';
import NeonCard from '../components/ui/NeonCard';

const ALL_ACHIEVEMENTS = [
  { id: 'first_song', icon: '🎵', title: 'Primera Nota', desc: 'Sube tu primera partitura', xp: 50, condition: (songs) => songs.length >= 1, color: 'text-neon-cyan' },
  { id: 'five_songs', icon: '🎶', title: 'Coleccionista', desc: 'Sube 5 canciones', xp: 150, condition: (songs) => songs.length >= 5, color: 'text-neon-purple' },
  { id: 'first_practice', icon: '🎯', title: 'Primer Ensayo', desc: 'Completa tu primera sesión de práctica', xp: 75, condition: (_, prog) => prog.length >= 1, color: 'text-neon-green' },
  { id: 'level_2', icon: '⭐', title: 'Subes de Nivel', desc: 'Alcanza el nivel 2 en una canción', xp: 100, condition: (_, prog) => prog.some(p => p.level_reached >= 2), color: 'text-neon-yellow' },
  { id: 'level_5', icon: '🏆', title: 'Maestro', desc: 'Completa los 5 niveles de una canción', xp: 500, condition: (_, prog) => prog.some(p => p.level_reached >= 5), color: 'text-neon-pink' },
  { id: 'piano_master', icon: '🎹', title: 'Pianista', desc: 'Aprende una canción de piano', xp: 200, condition: (songs) => songs.some(s => s.instrument === 'piano'), color: 'text-neon-cyan' },
  { id: 'guitar_hero', icon: '🎸', title: 'Guitar Hero', desc: 'Aprende una canción de guitarra', xp: 200, condition: (songs) => songs.some(s => s.instrument === 'guitar'), color: 'text-neon-green' },
  { id: 'three_instruments', icon: '🎼', title: 'Músico Completo', desc: 'Aprende canciones de 3 instrumentos distintos', xp: 350, condition: (songs) => new Set(songs.map(s => s.instrument)).size >= 3, color: 'text-neon-purple' },
  { id: 'mic_user', icon: '🎤', title: 'Al Aire', desc: 'Usa el micrófono durante una práctica', xp: 100, condition: () => false, color: 'text-neon-pink' },
  { id: 'speedrunner', icon: '⚡', title: 'Velocista', desc: 'Practica a más de 140 BPM', xp: 150, condition: () => false, color: 'text-neon-yellow' },
];

const LEVELS = [
  { level: 1, minXp: 0, maxXp: 500, title: 'Aprendiz' },
  { level: 2, minXp: 500, maxXp: 1200, title: 'Estudiante' },
  { level: 3, minXp: 1200, maxXp: 2500, title: 'Músico' },
  { level: 4, minXp: 2500, maxXp: 4500, title: 'Intérprete' },
  { level: 5, minXp: 4500, maxXp: 7000, title: 'Virtuoso' },
  { level: 6, minXp: 7000, maxXp: 10000, title: 'Maestro' },
  { level: 7, minXp: 10000, maxXp: 15000, title: 'Leyenda' },
];

export default function Achievements() {
  const { data: songs = [] } = useQuery({ queryKey: ['songs'], queryFn: () => base44.entities.Song.list() });
  const { data: progresses = [] } = useQuery({ queryKey: ['progresses'], queryFn: () => base44.entities.UserProgress.list() });

  const totalXp = progresses.reduce((sum, p) => sum + (p.xp_earned || 0), 0) + 2450;
  const currentLevel = LEVELS.findLast(l => totalXp >= l.minXp) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  const progressPct = nextLevel ? ((totalXp - currentLevel.minXp) / (nextLevel.minXp - currentLevel.minXp)) * 100 : 100;

  const achieved = ALL_ACHIEVEMENTS.filter(a => a.condition(songs, progresses));
  const locked = ALL_ACHIEVEMENTS.filter(a => !a.condition(songs, progresses));

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1 tracking-widest uppercase">Recompensas</p>
        <h1 className="font-orbitron font-bold text-3xl text-foreground">
          Logros & <span className="text-neon-yellow glow-text-purple">XP</span>
        </h1>
      </div>

      {/* Player card */}
      <NeonCard glow="purple" className="p-6 mb-8">
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-neon flex items-center justify-center"
              style={{ boxShadow: '0 0 30px hsla(270,80%,65%,0.5)' }}>
              <span className="font-orbitron font-black text-3xl text-white">{currentLevel.level}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 mb-1">
              <h2 className="font-orbitron font-bold text-xl text-foreground">{currentLevel.title}</h2>
              <span className="text-xs text-muted-foreground">Nivel {currentLevel.level}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-orbitron font-bold text-neon-yellow">{totalXp.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">XP totales</span>
            </div>
            {nextLevel && (
              <>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-gradient-neon rounded-full transition-all"
                    style={{ width: `${progressPct}%`, boxShadow: '0 0 8px hsla(270,80%,65%,0.7)' }} />
                </div>
                <p className="text-xs text-muted-foreground">{nextLevel.minXp - totalXp} XP para {nextLevel.title}</p>
              </>
            )}
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-3 text-center">
            {[
              { label: 'Canciones', value: songs.length, icon: Music },
              { label: 'Logros', value: achieved.length, icon: Trophy },
              { label: 'Sesiones', value: progresses.reduce((s, p) => s + (p.practice_sessions || 0), 0), icon: Flame },
              { label: 'Completas', value: progresses.filter(p => p.completed).length, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-2 rounded-xl bg-white/5">
                <div className="font-orbitron font-bold text-lg text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </NeonCard>

      {/* Achieved */}
      {achieved.length > 0 && (
        <div className="mb-8">
          <h2 className="font-orbitron font-semibold text-base mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-neon-yellow" /> Desbloqueados ({achieved.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achieved.map(a => (
              <NeonCard key={a.id} glow="purple" className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{a.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3 h-3 text-neon-yellow" />
                      <span className="text-xs font-bold text-neon-yellow">+{a.xp} XP</span>
                    </div>
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>
      )}

      {/* Locked */}
      <div>
        <h2 className="font-orbitron font-semibold text-base mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" /> Por desbloquear ({locked.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locked.map(a => (
            <NeonCard key={a.id} className="p-4 opacity-50">
              <div className="flex items-start gap-3">
                <div className="text-3xl grayscale">{a.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    {a.title} <Lock className="w-3 h-3 text-muted-foreground" />
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">+{a.xp} XP</span>
                  </div>
                </div>
              </div>
            </NeonCard>
          ))}
        </div>
      </div>
    </div>
  );
}