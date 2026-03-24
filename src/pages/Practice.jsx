import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Music, ChevronLeft, Zap, Brain, Star, CheckCircle } from 'lucide-react';
import NeonCard from '../components/ui/NeonCard';
import NeonButton from '../components/ui/NeonButton';
import TempoControl from '../components/practice/TempoControl';
import LevelProgress from '../components/practice/LevelProgress';
import MicListener from '../components/practice/MicListener';
import PianoVisualizer from '../components/visualizers/PianoVisualizer';
import GuitarVisualizer from '../components/visualizers/GuitarVisualizer';

const FEEDBACK_MESSAGES = [
  { type: 'good', message: '¡Excelente tempo! Estás en el ritmo perfectamente.' },
  { type: 'warning', message: 'El tempo está un poco irregular, intenta mantener el pulso.' },
  { type: 'bad', message: 'Vas fuera de tempo. Reduce la velocidad y practica más lento.' },
  { type: 'good', message: '¡Muy bien! Las notas suenan claras y precisas.' },
  { type: 'warning', message: 'Algunas notas suenan apagadas. Revisa la posición de los dedos.' },
];

export default function Practice() {
  const [searchParams] = useSearchParams();
  const songId = searchParams.get('song');
  const queryClient = useQueryClient();

  const [tempo, setTempo] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [beat, setBeat] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [activeNotes, setActiveNotes] = useState([]);

  const metronomeRef = useRef(null);
  const sessionRef = useRef(null);
  const feedbackCycleRef = useRef(0);

  const { data: song } = useQuery({
    queryKey: ['song', songId],
    queryFn: () => songId ? base44.entities.Song.get(songId) : null,
    enabled: !!songId,
  });

  const { data: allSongs = [] } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-updated_date', 20),
    enabled: !songId,
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', songId],
    queryFn: async () => {
      if (!songId) return null;
      const list = await base44.entities.UserProgress.filter({ song_id: songId });
      return list[0] || null;
    },
    enabled: !!songId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (progress) return base44.entities.UserProgress.update(progress.id, data);
      return base44.entities.UserProgress.create({ song_id: songId, song_title: song?.title, instrument: song?.instrument, ...data });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress', songId] }),
  });

  // Metronome
  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / tempo) * 1000;
      metronomeRef.current = setInterval(() => {
        setBeat(b => (b + 1) % 4);
        // Simulate note highlighting
        const demoNotes = [['C4', 'E4'], ['E4', 'G4'], ['G4', 'C5'], ['C4', 'G4', 'E5']];
        setActiveNotes(demoNotes[Math.floor(Math.random() * demoNotes.length)]);
      }, interval);
    } else {
      clearInterval(metronomeRef.current);
      setActiveNotes([]);
    }
    return () => clearInterval(metronomeRef.current);
  }, [isPlaying, tempo]);

  // Session timer
  useEffect(() => {
    if (isPlaying) {
      sessionRef.current = setInterval(() => {
        setSessionTime(t => t + 1);
        setXpEarned(x => x + Math.floor(Math.random() * 2));
      }, 1000);
    } else {
      clearInterval(sessionRef.current);
    }
    return () => clearInterval(sessionRef.current);
  }, [isPlaying]);

  // AI feedback simulation (when mic is active)
  useEffect(() => {
    if (!micActive) { setFeedback(null); return; }
    const id = setInterval(() => {
      feedbackCycleRef.current = (feedbackCycleRef.current + 1) % FEEDBACK_MESSAGES.length;
      setFeedback(FEEDBACK_MESSAGES[feedbackCycleRef.current]);
    }, 4000);
    setFeedback(FEEDBACK_MESSAGES[0]);
    return () => clearInterval(id);
  }, [micActive]);

  const handlePlayPause = () => {
    setIsPlaying(p => !p);
    if (!isPlaying) setTempo(song?.tempo || tempo);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setBeat(0);
    setSessionTime(0);
    setActiveNotes([]);
  };

  const handleLevelUp = (level) => {
    updateProgressMutation.mutate({ level_reached: level, xp_earned: xpEarned });
    setShowLevelUp(true);
    setTimeout(() => setShowLevelUp(false), 3000);
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const currentLevel = progress?.level_reached || 1;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Level up toast */}
      {showLevelUp && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass border border-yellow-500/40 rounded-2xl px-6 py-3 flex items-center gap-3"
          style={{ boxShadow: '0 0 30px hsla(50,95%,55%,0.4)' }}>
          <Star className="w-5 h-5 text-neon-yellow" />
          <span className="font-orbitron font-bold text-neon-yellow">¡NIVEL DESBLOQUEADO!</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link to={songId ? `/song/${songId}` : '/library'} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> {song ? song.title : 'Biblioteca'}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-muted-foreground text-sm mb-1 tracking-widest uppercase">Modo práctica</p>
            <h1 className="font-orbitron font-bold text-2xl lg:text-3xl">
              {song ? song.title : <span className="text-neon-cyan">Modo Libre</span>}
            </h1>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-muted-foreground">Sesión</div>
            <div className="font-orbitron font-bold text-neon-green">{formatTime(sessionTime)}</div>
            <div className="text-xs text-neon-yellow">+{xpEarned} XP</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main - metronome + visualizer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metronome */}
          <NeonCard glow="purple" className="p-6">
            <h3 className="font-semibold mb-6 text-center text-sm text-muted-foreground tracking-widest uppercase">Metrónomo</h3>

            {/* Beat indicators */}
            <div className="flex justify-center gap-3 mb-8">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`w-12 h-12 rounded-xl border transition-all duration-75 flex items-center justify-center ${
                  isPlaying && beat === i
                    ? i === 0
                      ? 'bg-primary/40 border-primary scale-110'
                      : 'bg-accent/30 border-accent scale-105'
                    : 'bg-white/5 border-white/10'
                }`}
                  style={isPlaying && beat === i ? { boxShadow: i === 0 ? '0 0 20px hsla(270,80%,65%,0.6)' : '0 0 15px hsla(190,90%,55%,0.5)' } : {}}>
                  <div className={`w-2 h-2 rounded-full ${isPlaying && beat === i ? (i === 0 ? 'bg-primary' : 'bg-accent') : 'bg-white/20'}`} />
                </div>
              ))}
            </div>

            <TempoControl tempo={tempo} setTempo={setTempo} isPlaying={isPlaying} onPlayPause={handlePlayPause} onReset={handleReset} />
          </NeonCard>

          {/* Instrument visualizer */}
          {song && (
            <NeonCard glow="cyan" className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {song.instrument === 'piano' ? '🎹' : '🎸'} Notas en tiempo real
              </h3>
              {(song.instrument === 'piano' || !song.instrument) && (
                <PianoVisualizer activeNotes={activeNotes} octaves={2} />
              )}
              {(song.instrument === 'guitar' || song.instrument === 'bass') && (
                <GuitarVisualizer activePositions={isPlaying ? [
                  { string: Math.floor(Math.random() * 6) + 1, fret: Math.floor(Math.random() * 5) }
                ] : []} />
              )}
              <p className="text-xs text-muted-foreground text-center mt-3">
                {isPlaying ? 'Reproduciendo notas de la partitura...' : 'Pulsa Play para ver las notas'}
              </p>
            </NeonCard>
          )}

          {/* Song selector if no song */}
          {!song && allSongs.length > 0 && (
            <NeonCard className="p-5">
              <h3 className="font-semibold mb-3">Selecciona una canción</h3>
              <div className="space-y-2">
                {allSongs.slice(0, 5).map(s => (
                  <Link key={s.id} to={`/practice?song=${s.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors border border-white/5 hover:border-white/10">
                    <span className="text-xl">{s.instrument === 'piano' ? '🎹' : s.instrument === 'guitar' ? '🎸' : '🎵'}</span>
                    <div>
                      <p className="text-sm font-medium">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.tempo} BPM</p>
                    </div>
                  </Link>
                ))}
              </div>
            </NeonCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Mic listener */}
          <MicListener isActive={micActive} onToggle={() => setMicActive(p => !p)} feedback={feedback} />

          {/* Level progress */}
          {song && (
            <NeonCard className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-neon-yellow" /> Progreso
              </h3>
              <LevelProgress currentLevel={currentLevel} onSelectLevel={handleLevelUp} />
            </NeonCard>
          )}

          {/* AI tips */}
          <NeonCard glow="pink" className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <Brain className="w-4 h-4 text-neon-pink" /> Consejo IA
            </h3>
            <div className="space-y-2">
              {[
                isPlaying ? '🎯 Mantén los hombros relajados mientras tocas' : '▶️ Pulsa Play para comenzar la sesión',
                micActive ? '🎤 Escuchando tu instrumento en tiempo real' : '🎤 Activa el micro para feedback en vivo',
                `⚡ Nivel actual: ${currentLevel}/5 — ¡Sigue practicando!`,
              ].map((tip, i) => (
                <p key={i} className="text-xs text-muted-foreground p-2 rounded-lg bg-white/3 border border-white/5">{tip}</p>
              ))}
            </div>
          </NeonCard>

          {/* Session stats */}
          <NeonCard className="p-4">
            <h3 className="font-semibold mb-3 text-sm">📊 Esta sesión</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Tiempo', value: formatTime(sessionTime), color: 'text-neon-cyan' },
                { label: 'XP ganado', value: `+${xpEarned}`, color: 'text-neon-yellow' },
                { label: 'Tempo', value: `${tempo} BPM`, color: 'text-neon-purple' },
                { label: 'Nivel', value: `${currentLevel}/5`, color: 'text-neon-green' },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-white/3">
                  <div className={`text-lg font-orbitron font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>
      </div>
    </div>
  );
}