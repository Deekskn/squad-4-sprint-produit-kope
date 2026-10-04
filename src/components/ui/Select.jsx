import { cn } from '@/lib/utils.js';

export function Select({ className, error, id, children, ...rest }) {
  return (
    <select
      id={id}
      className={cn(
        'block w-full rounded-[14px]   py-3 pl-4 pr-10 text-[14px] text-gray-900 transition-colors cursor-pointer focus:outline-none disabled:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed  appearance-none',
        'bg-[url("data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2714%27%20height=%2714%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%23475467%27%20stroke-width=%272.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27/%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center]',
        error ? 'border-danger-500 focus:border-danger-500' : 'border-gray-200 focus:border-primary-500',
        className,
      )}
      {...(error ? { 'aria-invalid': 'true' } : {})}
      {...rest}
    >
      {children}
    </select>
  );
}
