import { Link } from 'react-router-dom';
import { Play, Lock, Star, Music, Guitar, Piano } from 'lucide-react';
import NeonCard from '../ui/NeonCard';

const instrumentIcons = {
  piano: '🎹',
  guitar: '🎸',
  violin: '🎻',
  flute: '🪈',
  drums: '🥁',
  bass: '🎸',
  ukulele: '🪕',
  other: '🎵',
};

const difficultyConfig = {
  beginner: { label: 'Principiante', color: 'text-neon-green', bg: 'bg-green-500/15 border-green-500/30' },
  intermediate: { label: 'Intermedio', color: 'text-neon-yellow', bg: 'bg-yellow-500/15 border-yellow-500/30' },
  advanced: { label: 'Avanzado', color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30' },
  expert: { label: 'Experto', color: 'text-neon-pink', bg: 'bg-pink-500/15 border-pink-500/30' },
};

export default function SongCard({ song }) {
  const diff = difficultyConfig[song.difficulty] || difficultyConfig.beginner;
  const levelsTotal = 5;
  const levelsUnlocked = song.levels_unlocked || 1;
  const progress = (levelsUnlocked / levelsTotal) * 100;

  return (
    <Link to={`/song/${song.id}`}>
      <NeonCard className="p-5 hover:scale-[1.02] transition-transform duration-200 h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="text-3xl">{instrumentIcons[song.instrument] || '🎵'}</div>
          <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${diff.bg} ${diff.color}`}>
            {diff.label}
          </span>
        </div>

        <h3 className="font-bold text-foreground mb-1 text-sm leading-tight line-clamp-2">{song.title}</h3>
        {song.composer && <p className="text-xs text-muted-foreground mb-3">{song.composer}</p>}

        {/* Level progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-muted-foreground">Niveles</span>
            <span className="text-xs text-neon-purple font-medium">{levelsUnlocked}/{levelsTotal}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: levelsTotal }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${
                  i < levelsUnlocked
                    ? 'bg-gradient-neon'
                    : 'bg-white/10'
                }`}
                style={i < levelsUnlocked ? { boxShadow: '0 0 6px hsla(270,80%,65%,0.5)' } : {}}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {song.tempo && (
            <span className="text-xs text-muted-foreground">♩ {song.tempo} BPM</span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Play className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </div>
        </div>

        {song.status === 'processing' && (
          <div className="mt-2 text-xs text-neon-cyan flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Analizando con IA...
          </div>
        )}
      </NeonCard>
    </Link>
  );
}