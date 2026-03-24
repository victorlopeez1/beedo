import { Link, useLocation } from 'react-router-dom';
import { Home, Music, Upload, Trophy, Mic, BookOpen, Zap } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: Music, label: 'Mi Biblioteca', path: '/library' },
  { icon: Upload, label: 'Subir Partitura', path: '/upload' },
  { icon: Zap, label: 'Practicar', path: '/practice' },
  { icon: Trophy, label: 'Logros', path: '/achievements' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-20 lg:w-64 z-50 flex flex-col glass-dark border-r border-white/5">
      {/* Logo */}
      <div className="p-4 lg:p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 neon-purple" style={{boxShadow:'0 0 16px hsla(50,95%,55%,0.5)'}}>
            <img src="https://media.base44.com/images/public/69c24eed772f340cfd591b6a/3b206c187_generated_image.png" alt="BeeDo" className="w-full h-full object-cover" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-orbitron font-bold text-sm text-neon-yellow" style={{textShadow:'0 0 10px hsla(50,95%,55%,0.8)'}}>BEEDO</h1>
            <p className="text-xs text-muted-foreground">AI Music Learning</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 lg:p-4 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-primary/20 text-primary neon-purple'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary' : 'group-hover:text-neon-cyan transition-colors'}`} />
              <span className={`hidden lg:block text-sm font-medium ${isActive ? 'text-primary' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom - XP display */}
      <div className="p-3 lg:p-4 border-t border-white/5">
        <div className="hidden lg:block glass rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Nivel 7</span>
            <span className="text-xs text-neon-yellow font-bold">2,450 XP</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-3/5 bg-gradient-neon rounded-full" style={{boxShadow: '0 0 8px hsla(270,80%,65%,0.6)'}} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">550 XP para nivel 8</p>
        </div>
        <div className="lg:hidden flex justify-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-neon flex items-center justify-center">
            <span className="text-xs font-bold text-white font-orbitron">7</span>
          </div>
        </div>
      </div>
    </aside>
  );
}