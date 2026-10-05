import { cn } from '@/lib/utils.js';

/** Overlay translucide posé sur une image (coin bas-gauche ou bas-droite). */
export function FloatingCaption({ title, subtitle, icon: Icon, align = 'left', wide = false, className }) {
  return (
    <div
      className={cn(
        'absolute bottom-2 rounded-sm bg-white/92 px-4 py-3 backdrop-blur-sm',
        wide ? 'left-2 right-2' : align === 'right' ? 'right-2' : 'left-2',
        Icon && 'flex items-center gap-3',
        className,
      )}
    >
      {Icon && (
        <span className="flex size-9 items-center justify-center">
          <Icon size={24} strokeWidth={1.5} aria-hidden />
        </span>
      )}
      <div>
        <p className="text-[12px] font-semibold leading-tight text-gray-900">{title}</p>
        {subtitle && <p className="text-[11px] text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
