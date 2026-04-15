'use client';

import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-surface-elevated group-[.toaster]:text-ink group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-ink-muted',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-surface-muted group-[.toast]:text-ink',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
