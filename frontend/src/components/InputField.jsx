import * as React from 'react';
import { cn } from '../lib/utils';

export default function InputField({
  className,
  label,
  error,
  icon: Icon,
  right,
  containerClassName,
  ...props
}) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label ? (
        <label className="text-sm font-medium text-white/80">{label}</label>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
        ) : null}
        <input
          className={cn(
            'w-full rounded-2xl border bg-white/5 text-white placeholder-white/40 backdrop-blur-xl',
            'px-4 py-3 text-sm outline-none transition-all duration-300',
            Icon && 'pl-10',
            right && 'pr-11',
            error
              ? 'border-red-500/70 ring-2 ring-red-500/25'
              : 'border-white/10 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/25',
            className
          )}
          {...props}
        />

        {right ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
        ) : null}
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
