import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Music, Upload, Zap, ChevronRight, Star, TrendingUp } from 'lucide-react';
import StatsBar from '../components/dashboard/StatsBar';
import SongCard from '../components/dashboard/SongCard';
import NeonCard from '../components/ui/NeonCard';
import NeonButton from '../components/ui/NeonButton';

export default function Dashboard() {
  const { data: songs = [] } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-updated_date', 10),
  });

  const { data: progresses = [] } = useQuery({
    queryKey: ['progresses'],
    queryFn: () => base44.entities.UserProgress.list('-updated_date', 5),
  });

  const recentSongs = songs.slice(0, 6);
  const inProgressSongs = progresses.filter(p => !p.completed).slice(0, 3);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Hero header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm mb-1 tracking-widest uppercase font-medium">Bienvenido de vuelta</p>
            <h1 className="font-orbitron font-bold text-3xl lg:text-4xl text-foreground">
              Tu <span className="text-neon-purple glow-text-purple">Quest</span> Musical
            </h1>
          </div>
          <Link to="/upload">
            <NeonButton variant="solid" size="lg" className="hidden sm:flex">
              <Upload className="w-4 h-4" />
              Subir partitura
            </NeonButton>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <StatsBar />
      </div>

      {/* Continue practicing */}
      {inProgressSongs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-orbitron font-semibold text-lg text-foreground">Continúa practicando</h2>
            <Link to="/practice" className="text-xs text-neon-cyan hover:text-accent transition-colors flex items-center gap-1">
              Ver todo <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid gap-3">
            {inProgressSongs.map(progress => (
              <NeonCard key={progress.id} glow="cyan" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Music className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{progress.song_title || 'Canción'}</p>
                      <p className="text-xs text-muted-foreground">Nivel {progress.level_reached} • {progress.accuracy_avg || 0}% precisión</p>
                    </div>
                  </div>
                  <Link to={`/practice?song=${progress.song_id}`}>
                    <NeonButton variant="cyan" size="sm">
                      <Zap className="w-3.5 h-3.5" /> Practicar
                    </NeonButton>
                  </Link>
                </div>
                <div className="mt-3">
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all"
                      style={{ width: `${(progress.level_reached / 5) * 100}%`, boxShadow: '0 0 8px hsla(190,90%,55%,0.6)' }} />
                  </div>
                </div>
              </NeonCard>
            ))}
          </div>
        </div>
      )}

      {/* Song library */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-orbitron font-semibold text-lg text-foreground">Tu biblioteca</h2>
          <Link to="/library" className="text-xs text-neon-cyan hover:text-accent transition-colors flex items-center gap-1">
            Ver todo <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentSongs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSongs.map(song => <SongCard key={song.id} song={song} />)}
          </div>
        ) : (
          <NeonCard className="p-12 text-center">
            <div className="text-5xl mb-4 float">🎵</div>
            <h3 className="font-orbitron font-bold text-lg mb-2">No hay canciones aún</h3>
            <p className="text-muted-foreground text-sm mb-6">Sube tu primera partitura para comenzar tu quest musical</p>
            <Link to="/upload">
              <NeonButton variant="solid" size="lg">
                <Upload className="w-4 h-4" /> Subir primera partitura
              </NeonButton>
            </Link>
          </NeonCard>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-orbitron font-semibold text-lg text-foreground mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/upload">
            <NeonCard glow="purple" className="p-5 hover:scale-[1.02] transition-transform">
              <div className="text-2xl mb-2">📄</div>
              <h3 className="font-semibold text-sm mb-1">Subir PDF / Imagen</h3>
              <p className="text-xs text-muted-foreground">La IA analiza tu partitura automáticamente</p>
            </NeonCard>
          </Link>
          <Link to="/practice">
            <NeonCard glow="cyan" className="p-5 hover:scale-[1.02] transition-transform">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-semibold text-sm mb-1">Modo práctica</h3>
              <p className="text-xs text-muted-foreground">Aprende con el metrónomo y visualizador</p>
            </NeonCard>
          </Link>
          <Link to="/achievements">
            <NeonCard glow="pink" className="p-5 hover:scale-[1.02] transition-transform">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-semibold text-sm mb-1">Logros y XP</h3>
              <p className="text-xs text-muted-foreground">Desbloquea recompensas por practicar</p>
            </NeonCard>
          </Link>
        </div>
      </div>
    </div>
  );
}