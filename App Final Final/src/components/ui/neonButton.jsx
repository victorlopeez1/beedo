import { cn } from '@/lib/utils';

export default function NeonButton({ children, className, variant = 'purple', size = 'md', onClick, disabled, type = 'button' }) {
  const variants = {
    purple: 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 hover:border-primary/60 hover:shadow-[0_0_20px_hsla(270,80%,65%,0.4)]',
    cyan: 'bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 hover:border-accent/60 hover:shadow-[0_0_20px_hsla(190,90%,55%,0.4)]',
    pink: 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 border border-pink-500/40 hover:border-pink-500/60 hover:shadow-[0_0_20px_hsla(330,85%,60%,0.4)]',
    green: 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 hover:border-green-500/60 hover:shadow-[0_0_20px_hsla(145,80%,50%,0.4)]',
    solid: 'bg-gradient-neon text-white border-0 hover:shadow-[0_0_25px_hsla(270,80%,65%,0.5)] hover:scale-[1.02]',
    ghost: 'bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground border border-white/10',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg',
    md: 'px-4 py-2 text-sm rounded-xl',
    lg: 'px-6 py-3 text-base rounded-xl',
    xl: 'px-8 py-4 text-lg rounded-2xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-medium transition-all duration-200 flex items-center gap-2 justify-center disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant] || variants.purple,
        sizes[size] || sizes.md,
        className
      )}
    >
      {children}
    </button>
  );
}