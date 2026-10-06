import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { FileUpload } from '@/components/ui/FileUpload.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { MAX_PHOTOS, ALLOWED_MIME, MAX_FILE_SIZE_BYTES } from '@/lib/constants.js';
import { addPhoto, deletePhoto } from '@/features/photos/services/photos.service.js';
import { cn } from '@/lib/utils.js';

const MIN_SLOTS = 3;

export function PhotoManager({ photos = [], onChange }) {
  const { toast } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmPhoto, setConfirmPhoto] = useState(null);

  const remaining = Math.max(0, MAX_PHOTOS - photos.length);
  const full = remaining <= 0;

  const handleAdd = async (file, caption) => {
    if (!file) return;
    if (!ALLOWED_MIME.includes(file.type)) {
      toast({ message: 'Format non autorisé : seulement JPG ou PNG.', type: 'error' });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({ message: 'Fichier trop volumineux (max 5 Mo).', type: 'error' });
      return;
    }
    if (photos.length >= MAX_PHOTOS) {
      toast({ message: 'Limite de 10 photos atteinte.', type: 'error' });
      return;
    }
    setSubmitting(true);
    try {
      const created = await addPhoto(file, caption || null);
      const next = [...photos, created];
      onChange?.(next);
      toast({ message: 'Photo ajoutée avec succès.', type: 'success' });
    } catch (err) {
      const message =
        err?.errors?.photo || err?.message || "Erreur lors de l'ajout de la photo.";
      toast({ message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!confirmPhoto) return;
    setDeletingId(confirmPhoto.id);
    try {
      await deletePhoto(confirmPhoto.id);
      const next = photos.filter((p) => p.id !== confirmPhoto.id);
      onChange?.(next);
      toast({ message: 'Photo supprimée.', type: 'success' });
    } catch (err) {
      toast({ message: err?.message || 'Erreur de suppression.', type: 'error' });
    } finally {
      setDeletingId(null);
      setConfirmPhoto(null);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Photos de réalisations</h2>
          <p className="text-sm text-gray-500">
            Ajoutez jusqu'à <b>{MAX_PHOTOS}</b> photos (JPG ou PNG, 5 Mo max). Une vignette est générée automatiquement.
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            full ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-primary-50 text-primary-700 ring-1 ring-primary-200',
          )}
        >
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p) => {
          const isDeleting = deletingId === p.id;
          return (
            <figure
              key={p.id}
              className={cn(
                'group relative overflow-hidden rounded-xl ring-1 ring-gray-200 bg-gray-100',
                isDeleting && 'opacity-60',
              )}
            >
              <img
                src={p.thumbUrl || p.url}
                alt={p.caption || ''}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="bg-white/90 px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-100 min-h-[42px]">
                {p.caption || <span className="text-gray-400 italic">Sans légende</span>}
              </figcaption>
              <button
                type="button"
                onClick={() => setConfirmPhoto(p)}
                disabled={isDeleting}
                className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-md transition hover:bg-rose-50 focus-ring disabled:opacity-50"
                aria-label="Supprimer cette photo"
              >
                <X size={16} aria-hidden />
              </button>
              {isDeleting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-semibold text-white">
                  Suppression...
                </div>
              )}
            </figure>
          );
        })}

        {!full &&
          Array.from({ length: Math.max(MIN_SLOTS - photos.length, 1) }, (_, index) => (
            <UploaderSlot
              key={`slot-${index}`}
              slotNumber={photos.length + index + 1}
              submitting={submitting}
              onAdd={handleAdd}
              remaining={remaining}
            />
          ))}
      </div>

      <Modal
        open={!!confirmPhoto}
        onClose={() => !deletingId && setConfirmPhoto(null)}
        dismissable={!deletingId}
        title="Supprimer la photo ?"
        description="Cette action est irréversible. La photo disparaîtra aussi de votre fiche publique."
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirmPhoto(null)} disabled={!!deletingId}>
              Annuler
            </Button>
            <Button variant="danger" onClick={confirmDelete} loading={!!deletingId}>
              Supprimer
            </Button>
          </>
        }
      />
    </Card>
  );
}

function UploaderSlot({ onAdd, submitting, remaining, slotNumber }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  return (
    <div className="space-y-2 rounded-xl ring-1 ring-gray-200 bg-gray-50/60 p-1.5">
      <FileUpload
        label={submitting ? 'Ajout en cours...' : slotNumber ? `Emplacement ${slotNumber}` : 'Ajouter une photo'}
        hint={`${remaining} emplacement${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''} · JPG/PNG · 5 Mo`}
        value={file}
        onChange={setFile}
        caption={caption}
        onCaptionChange={setCaption}
        capture="environment"
        disabled={submitting}
      />
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onAdd(file, caption);
            setFile(null);
            setCaption('');
          }}
          disabled={!file || submitting}
          loading={submitting}
        >
          Ajouter
        </Button>
      </div>
    </div>
  );
}
