import { cn } from '@/shared/utils';

export function Table({ children }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full caption-bottom text-sm">{children}</table>
      </div>
    </div>
  );
}

export function TableHeader({ children }) {
  return (
    <thead className="border-b border-gray-200 bg-gray-50/70 text-left text-xs font-medium text-gray-500">
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className }) {
  return (
    <tr className={cn('align-middle transition-colors hover:bg-gray-50/60', className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }) {
  return (
    <th className={cn('h-11 whitespace-nowrap px-4 text-left align-middle font-semibold', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, colSpan, className }) {
  return (
    <td colSpan={colSpan} className={cn('px-4 py-3 align-middle', className)}>
      {children}
    </td>
  );
}

export function TableEmpty({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-gray-500">
        {children}
      </td>
    </tr>
  );
}
