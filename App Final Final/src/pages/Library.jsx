import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, Filter, Upload, Music } from 'lucide-react';
import SongCard from '../components/dashboard/SongCard';
import NeonCard from '../components/ui/NeonCard';
import NeonButton from '../components/ui/NeonButton';

const INSTRUMENTS = ['Todos', 'piano', 'guitar', 'violin', 'flute', 'drums', 'bass', 'other'];
const DIFFICULTIES = ['Todos', 'beginner', 'intermediate', 'advanced', 'expert'];
const DIFF_LABELS = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado', expert: 'Experto' };
const INST_LABELS = { piano: 'Piano', guitar: 'Guitarra', violin: 'Violín', flute: 'Flauta', drums: 'Batería', bass: 'Bajo', other: 'Otro' };

export default function Library() {
  const [search, setSearch] = useState('');
  const [instrument, setInstrument] = useState('Todos');
  const [difficulty, setDifficulty] = useState('Todos');

  const { data: songs = [], isLoading } = useQuery({
    queryKey: ['songs'],
    queryFn: () => base44.entities.Song.list('-created_date'),
  });

  const filtered = songs.filter(song => {
    const matchSearch = !search || song.title?.toLowerCase().includes(search.toLowerCase()) || song.composer?.toLowerCase().includes(search.toLowerCase());
    const matchInst = instrument === 'Todos' || song.instrument === instrument;
    const matchDiff = difficulty === 'Todos' || song.difficulty === difficulty;
    return matchSearch && matchInst && matchDiff;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-muted-foreground text-sm mb-1 tracking-widest uppercase">Colección</p>
          <h1 className="font-orbitron font-bold text-3xl text-foreground">
            Mi <span className="text-neon-pink glow-text-purple">Biblioteca</span>
          </h1>
        </div>
        <Link to="/upload">
          <NeonButton variant="solid">
            <Upload className="w-4 h-4" /> Subir
          </NeonButton>
        </Link>
      </div>

      {/* Search & filters */}
      <div className="space-y-3 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar canción o compositor..."
            className="w-full bg-secondary border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {INSTRUMENTS.map(i => (
            <button key={i} onClick={() => setInstrument(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                instrument === i ? 'border-primary/60 bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground hover:border-white/20'
              }`}>
              {INST_LABELS[i] || i}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {DIFFICULTIES.map(d => (
            <button key={d} onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                difficulty === d ? 'border-accent/60 bg-accent/15 text-accent' : 'border-white/10 text-muted-foreground hover:border-white/20'
              }`}>
              {DIFF_LABELS[d] || d}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="h-40 glass rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="text-xs text-muted-foreground mb-4">{filtered.length} canción{filtered.length !== 1 ? 'es' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(song => <SongCard key={song.id} song={song} />)}
          </div>
        </>
      ) : (
        <NeonCard className="p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-orbitron font-semibold text-lg mb-2">No hay resultados</h3>
          <p className="text-muted-foreground text-sm mb-6">
            {songs.length === 0 ? 'Sube tu primera partitura para comenzar' : 'Prueba con otros filtros'}
          </p>
          {songs.length === 0 && (
            <Link to="/upload">
              <NeonButton variant="solid">
                <Upload className="w-4 h-4" /> Subir partitura
              </NeonButton>
            </Link>
          )}
        </NeonCard>
      )}
    </div>
  );
}