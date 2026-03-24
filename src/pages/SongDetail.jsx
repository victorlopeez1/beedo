import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Play, Book, Zap, ChevronLeft, Star, Music, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import NeonCard from '../components/ui/NeonCard';
import NeonButton from '../components/ui/NeonButton';
import LevelProgress from '../components/practice/LevelProgress';
import PianoVisualizer from '../components/visualizers/PianoVisualizer';
import GuitarVisualizer from '../components/visualizers/GuitarVisualizer';

const difficultyConfig = {
  beginner: { label: 'Principiante', color: 'text-neon-green' },
  intermediate: { label: 'Intermedio', color: 'text-neon-yellow' },
  advanced: { label: 'Avanzado', color: 'text-orange-400' },
  expert: { label: 'Experto', color: 'text-neon-pink' },
};

export default function SongDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [demoNotes, setDemoNotes] = useState([]);

  const { data: song, isLoading } = useQuery({
    queryKey: ['song', id],
    queryFn: () => base44.entities.Song.get(id),
  });

  const { data: progress } = useQuery({
    queryKey: ['progress', id],
    queryFn: async () => {
      const list = await base44.entities.UserProgress.filter({ song_id: id });
      return list[0] || null;
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (level) => {
      if (progress) {
        return base44.entities.UserProgress.update(progress.id, { level_reached: level, levels_unlocked: level });
      } else {
        return base44.entities.UserProgress.create({
          song_id: id,
          song_title: song.title,
          instrument: song.instrument,
          level_reached: level,
          practice_sessions: 1,
        });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['progress', id] }),
  });

  const analysis = song?.analysis_result ? JSON.parse(song.analysis_result) : null;
  const notes = song?.notes_data ? JSON.parse(song.notes_data) : [];
  const diff = difficultyConfig[song?.difficulty] || difficultyConfig.beginner;
  const currentLevel = progress?.level_reached || 1;

  const demoPianoNotes = ['C4', 'E4', 'G4', 'C5'];
  const demoGuitarPositions = [
    { string: 1, fret: 0 }, { string: 2, fret: 1 }, { string: 3, fret: 0 }, { string: 4, fret: 2 }
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  if (!song) return (
    <div className="p-8 text-center">
      <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
      <p className="text-muted-foreground">Canción no encontrada</p>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link to="/library" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4 transition-colors">
          <ChevronLeft className="w-3.5 h-3.5" /> Biblioteca
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{song.instrument === 'piano' ? '🎹' : song.instrument === 'guitar' ? '🎸' : '🎵'}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-lg bg-white/5 border border-white/10 ${diff.color}`}>{diff.label}</span>
              {song.tempo && <span className="text-xs text-muted-foreground border border-white/10 rounded-lg px-2 py-1">♩ {song.tempo} BPM</span>}
            </div>
            <h1 className="font-orbitron font-bold text-2xl lg:text-3xl mb-1">{song.title}</h1>
            {song.composer && <p className="text-muted-foreground">{song.composer}</p>}
          </div>
          <div className="flex gap-3">
            <Link to={`/practice?song=${id}`}>
              <NeonButton variant="solid" size="lg">
                <Play className="w-4 h-4" /> Practicar ahora
              </NeonButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-secondary rounded-xl p-1">
        {[
          { id: 'overview', label: 'Resumen', icon: Book },
          { id: 'levels', label: 'Niveles', icon: Star },
          { id: 'visualizer', label: 'Visualizador', icon: Music },
          { id: 'tips', label: 'Consejos IA', icon: Zap },
        ].map(({ id: tabId, label, icon: Icon }) => (
          <button key={tabId} onClick={() => setActiveTab(tabId)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === tabId ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <NeonCard className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><Book className="w-4 h-4 text-primary" /> Información</h3>
            <div className="space-y-3">
              {[
                { label: 'Instrumento', value: song.instrument || 'No especificado' },
                { label: 'Dificultad', value: diff.label },
                { label: 'Tempo', value: song.tempo ? `${song.tempo} BPM` : 'No especificado' },
                { label: 'Género', value: song.genre || 'No especificado' },
                { label: 'Notas identificadas', value: notes.length > 0 ? notes.slice(0, 6).join(', ') : 'Análisis pendiente' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium text-right max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </NeonCard>

          {analysis?.summary && (
            <NeonCard glow="cyan" className="p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-accent" /> Análisis IA</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
            </NeonCard>
          )}

          <NeonCard glow="green" className="p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-neon-yellow" /> Tu progreso
            </h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-orbitron font-bold text-neon-purple">{currentLevel}</div>
                <div className="text-xs text-muted-foreground">Nivel actual</div>
              </div>
              <div className="flex-1">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className={`flex-1 h-2 rounded-full ${i < currentLevel ? 'bg-gradient-neon' : 'bg-white/10'}`}
                      style={i < currentLevel ? { boxShadow: '0 0 6px hsla(270,80%,65%,0.5)' } : {}} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{currentLevel}/5 niveles</p>
              </div>
            </div>
            {progress?.accuracy_avg > 0 && (
              <div className="mt-3 p-2 bg-white/5 rounded-lg flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Precisión media</span>
                <span className="text-xs font-bold text-neon-green">{progress.accuracy_avg}%</span>
              </div>
            )}
          </NeonCard>
        </div>
      )}

      {activeTab === 'levels' && (
        <NeonCard className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-neon-yellow" /> Plan de aprendizaje</h3>
          {analysis?.level_descriptions && (
            <div className="mb-4 space-y-2">
              {analysis.level_descriptions.map((desc, i) => (
                <div key={i} className={`p-3 rounded-xl text-xs border ${i + 1 <= currentLevel ? 'border-green-500/30 bg-green-500/5 text-green-300' : 'border-white/5 bg-white/2 text-muted-foreground'}`}>
                  <span className="font-medium text-foreground">Nivel {i + 1}: </span>{desc}
                </div>
              ))}
            </div>
          )}
          <LevelProgress currentLevel={currentLevel} onSelectLevel={(level) => updateProgressMutation.mutate(level)} />
          <div className="mt-4">
            <Link to={`/practice?song=${id}`}>
              <NeonButton variant="solid" className="w-full">
                <Play className="w-4 h-4" /> Practicar nivel {currentLevel}
              </NeonButton>
            </Link>
          </div>
        </NeonCard>
      )}

      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          {(song.instrument === 'piano' || !song.instrument) && (
            <NeonCard glow="purple" className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">🎹 Teclado Piano — Notas activas</h3>
                <button onClick={() => setDemoNotes(prev => prev.length ? [] : demoPianoNotes)}
                  className="text-xs text-neon-cyan hover:text-accent transition-colors">
                  {demoNotes.length ? 'Limpiar' : 'Ver demo'}
                </button>
              </div>
              <PianoVisualizer activeNotes={demoNotes.length ? demoNotes : notes.filter(n => n.match(/^[A-G]#?\d$/))} octaves={2} />
              <p className="text-xs text-muted-foreground mt-3 text-center">Las teclas iluminadas muestran las notas de la canción</p>
            </NeonCard>
          )}

          {(song.instrument === 'guitar' || song.instrument === 'bass' || song.instrument === 'ukulele') && (
            <NeonCard glow="cyan" className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">🎸 Mástil de Guitarra — Posiciones</h3>
              <GuitarVisualizer activePositions={demoGuitarPositions} />
              <p className="text-xs text-muted-foreground mt-3 text-center">Los círculos muestran dónde colocar los dedos</p>
            </NeonCard>
          )}

          {analysis?.key_points && (
            <NeonCard glow="pink" className="p-5">
              <h3 className="font-semibold mb-3">⚡ Puntos técnicos clave</h3>
              <div className="space-y-2">
                {analysis.key_points.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{tip}</span>
                  </div>
                ))}
              </div>
            </NeonCard>
          )}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="space-y-4">
          {analysis?.instrument_tips && (
            <NeonCard glow="cyan" className="p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                🎯 Consejos para {song.instrument || 'instrumento'}
              </h3>
              <div className="space-y-3">
                {analysis.instrument_tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="w-6 h-6 rounded-lg bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </NeonCard>
          )}

          <NeonCard glow="purple" className="p-5">
            <h3 className="font-semibold mb-4">📚 Guía de práctica</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: '🐢', title: 'Empieza lento', desc: 'Practica al 50% del tempo original hasta memorizar las notas' },
                { icon: '🎯', title: 'Por secciones', desc: 'Divide la canción en partes pequeñas y domínalas antes de unirlas' },
                { icon: '🔁', title: 'Repetición', desc: 'Repite cada sección mínimo 10 veces para que la memoria muscular se fije' },
                { icon: '👂', title: 'Escucha activa', desc: 'Escucha grabaciones del tema para internalizar la melodía' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="text-xl mb-2">{icon}</div>
                  <p className="text-sm font-medium mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </NeonCard>
        </div>
      )}
    </div>
  );
}