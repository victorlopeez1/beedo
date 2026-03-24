import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Music, Gauge, Clock, Key, ExternalLink, Gamepad2, Mic, BookOpen, Play } from 'lucide-react';
import NoteVisualizer from '@/components/music/NoteVisualizer';
import Metronome from '@/components/music/Metronome';
import TutorialPanel from '@/components/music/TutorialPanel';
import GuitarFretboard from '@/components/music/GuitarFretboard';
import SynthesiaPiano from '@/components/music/SynthesiaPiano';
import LearningLevels from '@/components/music/LearningLevels';
import MicListener from '@/components/music/MicListener';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const INSTRUMENT_EMOJI = {
  piano: '🎹', guitar: '🎸', violin: '🎻', flute: '🪈',
  trumpet: '🎺', saxophone: '🎷', drums: '🥁', bass: '🎸', cello: '🎻', other: '🎵'
};
const DIFFICULTY_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' };
const DIFFICULTY_COLORS = { beginner: '#6a9f6a', intermediate: '#c9a040', advanced: '#c07840', expert: '#c05040' };

const TABS = [
  { id: 'learn', label: '🎮 Aprender', icon: Gamepad2 },
  { id: 'play', label: '▶ Reproducir', icon: Play },
  { id: 'practice', label: '🥁 Practicar', icon: Mic },
  { id: 'listen', label: '🎧 Corrección IA', icon: Mic },
  { id: 'tutorial', label: '📖 Tutoriales', icon: BookOpen },
];

export default function ScorePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const scoreId = urlParams.get('id');
  const [activeTab, setActiveTab] = useState('learn');
  const [currentLevel, setCurrentLevel] = useState(0);

  const { data: score, isLoading } = useQuery({
    queryKey: ['score', scoreId],
    queryFn: () => base44.entities.Score.list().then(scores => scores.find(s => s.id === scoreId)),
    enabled: !!scoreId,
  });

  if (isLoading) return (
    <div className="flex justify-center py-24">
      <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: '#e8ddd0', borderTopColor: '#c9a96e' }} />
    </div>
  );

  if (!score) return (
    <div className="text-center py-24">
      <p style={{ color: '#8a7060' }}>Partitura no encontrada</p>
      <Link to="/Library"><Button variant="link" style={{ color: '#c9a96e' }}>Ir a Biblioteca</Button></Link>
    </div>
  );

  const notes = score.notes_data || [];
  const levels = score.learning_levels || [];
  const levelTempo = levels[currentLevel]?.suggested_tempo || score.tempo || 120;
  const diffColor = DIFFICULTY_COLORS[score.difficulty] || '#c9a040';

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/Library" className="inline-flex items-center gap-1.5 text-sm mb-2.5 transition-colors hover:opacity-70"
            style={{ color: '#b0a090' }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Biblioteca
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2.5 leading-tight" style={{ color: '#3a2a1a' }}>
            <span className="text-3xl">{INSTRUMENT_EMOJI[score.instrument] || '🎵'}</span>
            <span className="truncate">{score.title}</span>
          </h1>
        </div>
        {score.file_url && (
          <a href={score.file_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <Button variant="outline" size="sm" className="rounded-xl border h-9"
              style={{ borderColor: '#e8ddd0', color: '#8a7060', background: 'white' }}>
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Ver Original</span>
            </Button>
          </a>
        )}
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {score.instrument && (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium"
            style={{ background: '#faf8f4', borderColor: '#e8ddd0', color: '#7a6050' }}>
            <Music className="w-3 h-3" />{score.instrument}
          </span>
        )}
        {score.tempo && (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium"
            style={{ background: '#faf8f4', borderColor: '#e8ddd0', color: '#7a6050' }}>
            <Gauge className="w-3 h-3" />{score.tempo} BPM
          </span>
        )}
        {score.time_signature && (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium"
            style={{ background: '#faf8f4', borderColor: '#e8ddd0', color: '#7a6050' }}>
            <Clock className="w-3 h-3" />{score.time_signature}
          </span>
        )}
        {score.key_signature && (
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium"
            style={{ background: '#faf8f4', borderColor: '#e8ddd0', color: '#7a6050' }}>
            <Key className="w-3 h-3" />{score.key_signature}
          </span>
        )}
        {score.difficulty && (
          <span className="text-xs px-3 py-1.5 rounded-full font-semibold"
            style={{ background: `${diffColor}15`, color: diffColor, border: `1px solid ${diffColor}30` }}>
            {DIFFICULTY_LABELS[score.difficulty]}
          </span>
        )}
      </div>

      {/* Summary */}
      {score.analysis_summary && (
        <div className="rounded-xl px-4 py-3 border text-sm leading-relaxed"
          style={{ background: 'rgba(201,169,110,0.06)', borderColor: 'rgba(201,169,110,0.2)', color: '#5a4030' }}>
          {score.analysis_summary}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={activeTab === tab.id
              ? { background: 'linear-gradient(135deg, #c9a96e, #a07840)', color: 'white', boxShadow: '0 4px 12px rgba(160,120,64,0.25)' }
              : { background: 'white', color: '#8a7060', border: '1px solid #e8ddd0' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>

        {/* LEARN TAB */}
        {activeTab === 'learn' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3">
              <LearningLevels
                levels={levels}
                currentLevel={currentLevel}
                onSelectLevel={(lvl) => {
                  setCurrentLevel(lvl);
                  setActiveTab('play');
                }}
              />
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Metronome initialTempo={levelTempo} />
              {/* Warmup */}
              {score.warmup_exercises?.length > 0 && (
                <div className="rounded-2xl border p-5" style={{ background: 'white', borderColor: '#e8ddd0' }}>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: '#3a2a1a' }}>🤸 Calentamiento</h3>
                  <div className="space-y-2">
                    {score.warmup_exercises.map((ex, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#7a6050' }}>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 text-white"
                          style={{ background: '#c9a96e' }}>{i + 1}</div>
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PLAY TAB */}
        {activeTab === 'play' && (
          <div className="space-y-4">
            {score.instrument === 'piano'
              ? <SynthesiaPiano notes={notes} tempo={levelTempo} />
              : <NoteVisualizer notes={notes} tempo={levelTempo} />
            }
            {score.instrument === 'guitar' && <GuitarFretboard activeNote={notes[0]?.note} />}
          </div>
        )}

        {/* PRACTICE TAB */}
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Metronome initialTempo={levelTempo} />
            <NoteVisualizer notes={notes} tempo={levelTempo} />
          </div>
        )}

        {/* LISTEN TAB */}
        {activeTab === 'listen' && (
          <div className="max-w-lg">
            <MicListener tempo={score.tempo || 120} />
          </div>
        )}

        {/* TUTORIAL TAB */}
        {activeTab === 'tutorial' && (
          <TutorialPanel instrument={score.instrument} tips={score.tutorial_tips || []} />
        )}

      </motion.div>
    </div>
  );
}