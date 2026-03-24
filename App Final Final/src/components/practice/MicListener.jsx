import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, AlertTriangle, CheckCircle } from 'lucide-react';
import NeonCard from '../ui/NeonCard';

export default function MicListener({ isActive, onToggle, feedback }) {
  const [volume, setVolume] = useState(0);
  const [bars, setBars] = useState(Array(20).fill(0));
  const animRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isActive]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const newBars = Array.from({ length: 20 }, (_, i) =>
          (data[Math.floor(i * data.length / 20)] || 0) / 255
        );
        setBars(newBars);
        setVolume(newBars.reduce((a, b) => a + b, 0) / newBars.length);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (e) {
      console.log('Mic not available');
    }
  };

  const stopListening = () => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setBars(Array(20).fill(0));
    setVolume(0);
  };

  return (
    <NeonCard glow={isActive ? 'green' : 'purple'} className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-sm font-medium">Escucha en vivo</span>
        </div>
        <button onClick={onToggle}
          className={`p-2 rounded-xl transition-all ${isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-primary/20 text-primary hover:bg-primary/30'}`}>
          {isActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>

      {/* Waveform */}
      <div className="flex items-end gap-0.5 h-12 mb-3">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t transition-all duration-75"
            style={{
              height: `${Math.max(4, h * 100)}%`,
              background: isActive
                ? `hsl(${145 + h * 50},80%,${50 + h * 20}%)`
                : 'rgba(255,255,255,0.1)',
              boxShadow: isActive && h > 0.3 ? `0 0 6px hsla(145,80%,55%,0.6)` : 'none'
            }} />
        ))}
      </div>

      {/* AI Feedback */}
      {feedback && (
        <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${
          feedback.type === 'good' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
          feedback.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
          'bg-red-500/10 text-red-400 border border-red-500/20'
        }`}>
          {feedback.type === 'good' ? <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> :
           <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {!feedback && isActive && (
        <p className="text-xs text-muted-foreground text-center">Toca tu instrumento...</p>
      )}
      {!isActive && (
        <p className="text-xs text-muted-foreground text-center">Activa el micrófono para recibir feedback en tiempo real</p>
      )}
    </NeonCard>
  );
}