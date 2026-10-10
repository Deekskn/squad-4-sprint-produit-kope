import { cn } from '@/shared/utils';
import { Input } from './Input.jsx';
import { Textarea } from './Textarea.jsx';
import { CustomSelect } from './CustomSelect.jsx';

const FIELD_LABEL = 'block text-sm font-medium text-gray-700 mb-1.5';
const FIELD_HELP = 'mt-1 text-xs text-gray-500';
const FIELD_ERROR = 'mt-1 text-xs text-danger-500';

const COMPONENT = { input: Input, textarea: Textarea, select: CustomSelect };

export function FormField({
  id,
  label,
  help,
  error,
  as = 'input',
  className,
  children,
  required,
  counter,
  ...rest
}) {
  const Control = COMPONENT[as] || Input;
  const errorId = error ? `${id}-error` : undefined;
  const helpId = help ? `${id}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cn('space-y-0', className)}>
      {label && (
        <label htmlFor={id} className={FIELD_LABEL}>
          {label} {required && <span className="text-danger-500">*</span>}
        </label>
      )}
      {children ? (
        children
      ) : (
        <Control id={id} error={error} aria-describedby={describedBy} {...rest} />
      )}
      {counter && (
        <div className="mt-0.5 text-right text-[11px] text-gray-400">{counter}</div>
      )}
      {help && <p id={helpId} className={FIELD_HELP}>{help}</p>}
      {error && <p id={errorId} role="alert" className={FIELD_ERROR}>{error}</p>}
    </div>
  );
}
