import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils/common';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'border border-border text-foreground hover:bg-accent hover:text-accent-foreground',
        success:
          'border-transparent bg-green-500 text-white hover:bg-green-600 dark:bg-green-400 dark:text-gray-900 dark:hover:bg-green-500',
          warning:
          'border-transparent bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-400 dark:text-gray-900 dark:hover:bg-orange-500',
        info:
          'border-transparent bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-500',
        light:
          'border border-gray-300 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
        dark:
          'border border-gray-800 bg-gray-900 text-white hover:bg-gray-800 dark:border-gray-700 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300',
      },
      
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
