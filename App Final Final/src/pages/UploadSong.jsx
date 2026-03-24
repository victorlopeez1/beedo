import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Image, Mic, Loader2, CheckCircle, Music, X } from 'lucide-react';
import NeonCard from '../components/ui/NeonCard';
import NeonButton from '../components/ui/NeonButton';

const INSTRUMENTS = [
  { value: 'piano', label: 'Piano', emoji: '🎹' },
  { value: 'guitar', label: 'Guitarra', emoji: '🎸' },
  { value: 'violin', label: 'Violín', emoji: '🎻' },
  { value: 'flute', label: 'Flauta', emoji: '🪈' },
  { value: 'drums', label: 'Batería', emoji: '🥁' },
  { value: 'bass', label: 'Bajo', emoji: '🎸' },
  { value: 'ukulele', label: 'Ukulele', emoji: '🪕' },
  { value: 'other', label: 'Otro', emoji: '🎵' },
];

export default function UploadSong() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState(1); // 1=upload, 2=confirm, 3=analyzing
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [form, setForm] = useState({
    title: '', composer: '', instrument: '', tempo: 120, genre: ''
  });

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
    setStep(2);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const analyzeWithAI = async () => {
    setLoading(true);
    setStep(3);

    let fileUrl = null;
    if (file) {
      const res = await base44.integrations.Core.UploadFile({ file });
      fileUrl = res.file_url;
    }

    const prompt = `Eres un experto músico y analista de partituras. Analiza esta partitura musical y proporciona un análisis detallado.
    Información proporcionada por el usuario:
    - Título: ${form.title || 'No especificado'}
    - Instrumento: ${form.instrument || 'No especificado'}
    - Compositor: ${form.composer || 'No especificado'}
    
    Proporciona un análisis completo con:
    1. Detección de dificultad (beginner/intermediate/advanced/expert)
    2. Tempo recomendado en BPM
    3. Género musical
    4. Puntos técnicos clave para aprender esta pieza
    5. Consejos específicos para el instrumento
    6. Cómo dividir el aprendizaje en 5 niveles progresivos
    7. Notas/acordes principales que aparecen (lista de notas en notación estándar)
    
    Responde en español.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: fileUrl ? [fileUrl] : [],
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          composer: { type: 'string' },
          instrument: { type: 'string' },
          difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced', 'expert'] },
          tempo: { type: 'number' },
          genre: { type: 'string' },
          key_points: { type: 'array', items: { type: 'string' } },
          instrument_tips: { type: 'array', items: { type: 'string' } },
          level_descriptions: { type: 'array', items: { type: 'string' } },
          main_notes: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' }
        }
      }
    });

    setAnalysis(result);
    const songData = {
      title: form.title || result.title || 'Nueva canción',
      composer: form.composer || result.composer || '',
      instrument: form.instrument || result.instrument || 'other',
      difficulty: result.difficulty || 'beginner',
      tempo: form.tempo || result.tempo || 120,
      genre: form.genre || result.genre || '',
      file_url: fileUrl || '',
      file_type: file?.type || '',
      analysis_result: JSON.stringify(result),
      notes_data: JSON.stringify(result.main_notes || []),
      status: 'ready',
      xp_reward: { beginner: 100, intermediate: 200, advanced: 300, expert: 500 }[result.difficulty] || 100,
    };

    await base44.entities.Song.create(songData);
    setLoading(false);
    navigate('/library');
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-muted-foreground text-sm mb-1 tracking-widest uppercase">Nueva canción</p>
        <h1 className="font-orbitron font-bold text-3xl text-foreground">
          Subir <span className="text-neon-cyan glow-text-cyan">Partitura</span>
        </h1>
      </div>

      {/* Step 1: File upload */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-12 text-center ${
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-white/15 hover:border-primary/50 hover:bg-primary/5'
            }`}
            style={dragOver ? { boxShadow: '0 0 30px hsla(270,80%,65%,0.3)' } : {}}
          >
            <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <div className="text-5xl mb-4 float">🎼</div>
            <h3 className="font-orbitron font-semibold text-lg mb-2">Arrastra tu partitura aquí</h3>
            <p className="text-muted-foreground text-sm mb-4">PDF, PNG, JPG — la IA lo analiza automáticamente</p>
            <NeonButton variant="purple" size="md">
              <Upload className="w-4 h-4" /> Seleccionar archivo
            </NeonButton>
          </div>

          {/* Format options */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: FileText, label: 'PDF', desc: 'Partitura digital', color: 'text-neon-cyan' },
              { icon: Image, label: 'Imagen', desc: 'Foto de partitura', color: 'text-neon-pink' },
              { icon: Music, label: 'Manual', desc: 'Sin archivo', color: 'text-neon-green' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <NeonCard key={label} className="p-4 text-center cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={label === 'Manual' ? () => { setFile(null); setStep(2); } : () => fileRef.current.click()}>
                <Icon className={`w-6 h-6 mx-auto mb-2 ${color}`} />
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </NeonCard>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details form */}
      {step === 2 && (
        <div className="space-y-6">
          {preview && (
            <NeonCard className="p-3 relative">
              <img src={preview} alt="Partitura" className="w-full max-h-48 object-contain rounded-lg" />
              <button onClick={() => { setFile(null); setPreview(null); setStep(1); }}
                className="absolute top-2 right-2 p-1 rounded-lg bg-background/80 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </NeonCard>
          )}
          {file && !preview && (
            <NeonCard className="p-4 flex items-center gap-3">
              <FileText className="w-8 h-8 text-neon-cyan" />
              <div>
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button onClick={() => { setFile(null); setStep(1); }} className="ml-auto text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </NeonCard>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Título de la canción</label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Ej: Für Elise, Bohemian Rhapsody..."
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Compositor (opcional)</label>
              <input
                value={form.composer}
                onChange={e => setForm(p => ({ ...p, composer: e.target.value }))}
                placeholder="Ej: Beethoven, Freddie Mercury..."
                className="w-full bg-secondary border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-3 block">Instrumento</label>
              <div className="grid grid-cols-4 gap-2">
                {INSTRUMENTS.map(({ value, label, emoji }) => (
                  <button key={value}
                    onClick={() => setForm(p => ({ ...p, instrument: value }))}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      form.instrument === value
                        ? 'border-primary/60 bg-primary/15 text-primary'
                        : 'border-white/10 hover:border-white/20 text-muted-foreground'
                    }`}>
                    <div className="text-xl mb-1">{emoji}</div>
                    <div className="text-xs font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Tempo base: {form.tempo} BPM</label>
              <input type="range" min="20" max="300" value={form.tempo}
                onChange={e => setForm(p => ({ ...p, tempo: Number(e.target.value) }))}
                className="w-full" style={{ accentColor: 'hsl(270,80%,65%)' }} />
            </div>
          </div>

          <div className="flex gap-3">
            <NeonButton variant="ghost" onClick={() => setStep(1)}>← Atrás</NeonButton>
            <NeonButton variant="solid" className="flex-1" onClick={analyzeWithAI}>
              <Music className="w-4 h-4" /> Analizar con IA
            </NeonButton>
          </div>
        </div>
      )}

      {/* Step 3: Analyzing */}
      {step === 3 && (
        <NeonCard className="p-12 text-center">
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-spin border-t-primary" />
            <div className="absolute inset-3 rounded-full border-2 border-accent/30 animate-spin border-b-accent" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h3 className="font-orbitron font-bold text-xl mb-2 text-neon-purple">Analizando...</h3>
          <p className="text-muted-foreground text-sm mb-6">La IA está estudiando tu partitura, detectando notas, tempo y dificultad</p>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            {['Procesando archivo...', 'Detectando notas y acordes...', 'Calculando dificultad...', 'Creando plan de aprendizaje...'].map((t, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                {t}
              </div>
            ))}
          </div>
        </NeonCard>
      )}
    </div>
  );
}