import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * shadcn/ui Button — New York style, tuned for Loqui tokens.
 * See design-system.md §4.5 (primary) and §4.6 (secondary/link).
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-medium transition-colors transition-transform focus-visible:outline-none focus-visible:shadow-focus disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] ease-out-quart',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-sm hover:bg-primary-light',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-border bg-transparent text-ink hover:bg-surface-muted',
        secondary:
          'bg-surface-muted text-ink hover:bg-surface-elevated',
        ghost: 'hover:bg-surface-muted text-ink',
        link: 'text-ink-muted underline-offset-4 hover:text-ink hover:underline',
      },
      size: {
        default: 'h-14 px-6 text-[17px] tracking-[-0.005em]',
        sm: 'h-10 rounded-md px-4 text-body-sm',
        lg: 'h-14 rounded-md px-8 text-body-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
