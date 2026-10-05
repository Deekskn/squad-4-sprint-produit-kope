import { cn } from '@/lib/utils.js';

export function Table({ children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className }) {
  return <tr className={cn('align-top', className)}>{children}</tr>;
}

export function TableHead({ children, className }) {
  return <th className={cn('px-4 py-3', className)}>{children}</th>;
}

export function TableCell({ children, colSpan, className }) {
  return (
    <td colSpan={colSpan} className={cn('px-4 py-3', className)}>
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-gray-500">
        {children}
      </td>
    </tr>
  );
}
