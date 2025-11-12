import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import clsx from 'clsx';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        warning: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        secondary: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <div className={clsx(badgeVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
}

export default Badge;
