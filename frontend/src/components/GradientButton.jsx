import * as React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export default function GradientButton({ className, ...props }) {
  return (
    <Button
      className={cn(
        'relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white',
        'shadow-[0_10px_30px_-18px_rgba(0,0,0,0.85)]',
        'hover:from-blue-400 hover:to-purple-400 hover:shadow-[0_0_40px_hsl(var(--primary)/0.35)]',
        'active:scale-[0.99]',
        className
      )}
      {...props}
    />
  );
}
