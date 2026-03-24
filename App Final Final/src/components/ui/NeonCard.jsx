import { cn } from '@/lib/utils';

export default function NeonCard({ children, className, glow = 'purple', onClick }) {
  const glowMap = {
    purple: 'hover:shadow-[0_0_30px_hsla(270,80%,65%,0.2)] border-purple-500/20',
    cyan: 'hover:shadow-[0_0_30px_hsla(190,90%,55%,0.2)] border-cyan-500/20',
    pink: 'hover:shadow-[0_0_30px_hsla(330,85%,60%,0.2)] border-pink-500/20',
    green: 'hover:shadow-[0_0_30px_hsla(145,80%,50%,0.2)] border-green-500/20',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'glass rounded-2xl border transition-all duration-300',
        glowMap[glow] || glowMap.purple,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}