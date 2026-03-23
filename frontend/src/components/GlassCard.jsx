import * as React from 'react';
import { cn } from '../lib/utils';

const GlassCard = React.forwardRef(
  ({ className, hover = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl',
        'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_18px_60px_-40px_rgba(0,0,0,0.85)]',
        hover &&
          'transition-all duration-300 will-change-transform hover:scale-[1.02] hover:border-white/20 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_0_45px_hsl(var(--primary)/0.18)]',
        className
      )}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';

export default GlassCard;
