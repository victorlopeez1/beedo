import { Lock, Star, CheckCircle, ChevronRight } from 'lucide-react';

const levelConfig = [
  { name: 'Nivel 1', subtitle: 'Melodía básica', xp: 50, desc: 'Notas principales, tempo lento' },
  { name: 'Nivel 2', subtitle: 'Ritmo correcto', xp: 100, desc: 'Tempo original, notas completas' },
  { name: 'Nivel 3', subtitle: 'Dinámica', xp: 150, desc: 'Matices de volumen y expresión' },
  { name: 'Nivel 4', subtitle: 'Técnica avanzada', xp: 200, desc: 'Ornamentos y articulación' },
  { name: 'Nivel 5', subtitle: 'Maestría', xp: 300, desc: 'Interpretación completa perfecta' },
];

export default function LevelProgress({ currentLevel = 1, onSelectLevel }) {
  return (
    <div className="space-y-2">
      {levelConfig.map((level, i) => {
        const levelNum = i + 1;
        const isUnlocked = levelNum <= currentLevel;
        const isCompleted = levelNum < currentLevel;
        const isCurrent = levelNum === currentLevel;

        return (
          <button
            key={levelNum}
            onClick={() => isUnlocked && onSelectLevel(levelNum)}
            disabled={!isUnlocked}
            className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
              isCurrent
                ? 'border-primary/60 bg-primary/10 hover:bg-primary/15'
                : isCompleted
                ? 'border-green-500/30 bg-green-500/5 hover:bg-green-500/10'
                : 'border-white/5 bg-white/2 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-orbitron font-bold ${
                isCompleted ? 'bg-green-500/20 text-green-400' :
                isCurrent ? 'bg-primary/20 text-primary' :
                'bg-white/5 text-muted-foreground'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> :
                 !isUnlocked ? <Lock className="w-3.5 h-3.5" /> :
                 levelNum}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{level.name}</span>
                  <span className="text-xs text-muted-foreground">— {level.subtitle}</span>
                </div>
                {isUnlocked && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{level.desc}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-neon-yellow flex-shrink-0">
                <Star className="w-3 h-3" />
                <span className="text-xs font-mono">{level.xp}</span>
              </div>
              {isCurrent && <ChevronRight className="w-4 h-4 text-primary" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}