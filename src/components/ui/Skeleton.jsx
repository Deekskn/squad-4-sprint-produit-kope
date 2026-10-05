import { cn } from '@/lib/utils.js';

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-gray-100', className)} />;
}
