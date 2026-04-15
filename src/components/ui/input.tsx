import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Input — adjusted heights + radius to match design-system.md §4.7.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-14 w-full rounded-md border border-border bg-surface-muted px-4 text-body-lg text-ink placeholder:text-ink-subtle transition-colors focus-visible:outline-none focus-visible:border-primary focus-visible:border-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
