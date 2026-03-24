import { Minus, Plus, Play, Pause, RotateCcw } from 'lucide-react';
import NeonButton from '../ui/NeonButton';

export default function TempoControl({ tempo, setTempo, isPlaying, onPlayPause, onReset }) {
  const adjustTempo = (delta) => setTempo(prev => Math.max(20, Math.min(300, prev + delta)));

  const getTempoLabel = (bpm) => {
    if (bpm < 60) return 'Largo';
    if (bpm < 66) return 'Larghetto';
    if (bpm < 76) return 'Adagio';
    if (bpm < 108) return 'Andante';
    if (bpm < 120) return 'Moderato';
    if (bpm < 156) return 'Allegro';
    if (bpm < 176) return 'Vivace';
    return 'Presto';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* BPM Display */}
      <div className="relative">
        <div className="text-6xl font-orbitron font-bold text-neon-purple glow-text-purple tabular-nums">
          {tempo}
        </div>
        <div className="text-center text-xs text-muted-foreground font-medium tracking-widest uppercase mt-1">
          {getTempoLabel(tempo)} BPM
        </div>
      </div>

      {/* Tempo slider */}
      <div className="flex items-center gap-3 w-full max-w-xs">
        <button onClick={() => adjustTempo(-5)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all flex items-center justify-center">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input
          type="range" min="20" max="300" value={tempo}
          onChange={(e) => setTempo(Number(e.target.value))}
          className="flex-1 accent-purple-500 h-2 rounded-full cursor-pointer"
          style={{ accentColor: 'hsl(270,80%,65%)' }}
        />
        <button onClick={() => adjustTempo(5)}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all flex items-center justify-center">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick presets */}
      <div className="flex gap-2">
        {[60, 80, 100, 120, 140].map(bpm => (
          <button key={bpm} onClick={() => setTempo(bpm)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              tempo === bpm ? 'bg-primary/30 text-primary border border-primary/50' : 'bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10'
            }`}>
            {bpm}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button onClick={onReset}
          className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground flex items-center justify-center transition-all">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button onClick={onPlayPause}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all font-medium ${
            isPlaying
              ? 'bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30'
              : 'bg-gradient-neon text-white hover:scale-105'
          }`}
          style={!isPlaying ? { boxShadow: '0 0 25px hsla(270,80%,65%,0.5)' } : {}}>
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}