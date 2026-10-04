import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { cn, truncate } from '@/lib/utils.js';

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
        {photos.map((p, i) => (
          <li
            key={p.id ?? i}
            className="group relative overflow-hidden rounded-xl ring-1 ring-gray-200 bg-gray-100"
          >
            <button
              type="button"
              className="block aspect-[4/3] w-full focus-ring"
              onClick={() => setActiveIndex(i)}
              aria-label={`Ouvrir la photo ${i + 1}${p.caption ? ` : ${p.caption}` : ''}`}
            >
              <img
                src={p.thumbUrl || p.url}
                alt={p.caption || ''}
                loading="lazy"
                className="h-full w-full object-cover transition group-hover:scale-[1.02]"
              />
            </button>
            {p.caption && (
              <p className="truncate bg-white/90 px-2.5 py-1.5 text-xs text-gray-700 ring-1 ring-gray-100">
                {truncate(p.caption, 80)}
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
        ))}
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
  return (
    <Modal
      open
      onClose={onClose}
      size="full"
      title={p?.caption || `Photo ${index + 1} / ${photos.length}`}
      description={p?.caption ? '' : undefined}
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
          alt={p?.caption || ''}
          className={cn(
            'mx-auto max-h-[72vh] w-auto max-w-full rounded-lg object-contain',
          )}
        />
      </div>
    </Modal>
  );
}
