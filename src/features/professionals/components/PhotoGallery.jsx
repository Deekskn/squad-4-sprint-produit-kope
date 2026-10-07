import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Modal } from '@/shared/components/ui/Modal.jsx';
import { Button } from '@/shared/components/ui/Button.jsx';
import { cn, truncate } from '@/shared/utils';

function EmptyGallery() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
      Aucune photo pour le moment.
    </div>
  );
}

export function PhotoGallery({ photos = [], editable = false, onDelete, allowEmptyMessage = true }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!photos.length && allowEmptyMessage) return <EmptyGallery />;

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => {
          const title = p.title || p.caption;
          return (
          <li
            key={p.id ?? i}
            className="group relative overflow-hidden rounded-xl ring-1 ring-gray-200 bg-gray-100"
          >
            <button
              type="button"
              className="block aspect-[4/3] w-full focus-ring"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ouvrir la photo ${i + 1}${title ? ` : ${title}` : ''}`}
            >
              <img
                src={p.thumbUrl || p.url}
                alt={title || ''}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
            </button>
            {title && (
              <p className="truncate bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-gray-800 ring-1 ring-gray-100">
                {truncate(title, 80)}
              </p>
            )}
            {p.description && (
              <p className="line-clamp-2 bg-white/90 px-2.5 py-1.5 text-xs text-gray-500 ring-1 ring-gray-100">
                {truncate(p.description, 120)}
              </p>
            )}
            {editable && onDelete && (
              <button
                type="button"
                onClick={() => onDelete?.(p, i)}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-md opacity-0 transition hover:bg-rose-50 focus-ring group-hover:opacity-100"
                aria-label="Supprimer la photo"
              >
                <X size={16} aria-hidden />
              </button>
            )}
          </li>
          );
        })}
      </ul>
      {activeIndex != null && (
        <Lightbox
          photos={photos}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onNavigate={(n) => setActiveIndex((cur) => {
            if (cur == null) return n;
            const len = photos.length;
            return (cur + n + len) % len;
          })}
        />
      )}
    </div>
  );
}

function Lightbox({ photos, index, onClose, onNavigate }) {
  const p = photos[index];
  const title = p?.title || p?.caption;
  return (
    <Modal
      open
      onClose={onClose}
      size="full"
      title={title || `Photo ${index + 1} / ${photos.length}`}
      description={p?.description || undefined}
      actions={
        <>
          <Button variant="secondary" onClick={() => onNavigate(-1)} disabled={photos.length < 2}>
            <span className="inline-flex items-center gap-1"><ChevronLeft size={16} aria-hidden /> Précédente</span>
          </Button>
          <Button variant="secondary" onClick={() => onNavigate(+1)} disabled={photos.length < 2}>
            <span className="inline-flex items-center gap-1">Suivante <ChevronRight size={16} aria-hidden /></span>
          </Button>
          <Button onClick={onClose}>Fermer</Button>
        </>
      }
    >
      <div className="relative">
        <img
          src={p?.url || p?.thumbUrl}
          alt={title || ''}
          className={cn(
            'mx-auto max-h-[72vh] w-auto max-w-full rounded-lg object-contain',
          )}
        />
      </div>
    </Modal>
  );
}
