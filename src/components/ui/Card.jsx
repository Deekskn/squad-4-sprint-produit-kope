import { cn } from '@/lib/utils.js';

export function Card({ className, as: As = 'article', ...rest }) {
  return (
    <As
      className={cn(
        'rounded-[16px] border border-gray-200 bg-white transition',
        className,
      )}
      {...rest}
    />
  );
}
