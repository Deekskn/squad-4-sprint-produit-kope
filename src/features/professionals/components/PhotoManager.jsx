import { useState } from 'react';
import { ImagePlus, Pencil, Trash } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button.jsx';
import { Input } from '@/shared/components/ui/Input.jsx';
import { Textarea } from '@/shared/components/ui/Textarea.jsx';
import { FormField } from '@/shared/components/ui/FormField.jsx';
import { FileUpload } from '@/shared/components/ui/FileUpload.jsx';
import { Modal } from '@/shared/components/ui/Modal.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/Dialog.jsx';
import { Card } from '@/shared/components/ui/Card.jsx';
import { FloatingCaption } from '@/shared/components/ui/FloatingCaption.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { MAX_PHOTOS, ALLOWED_MIME, MAX_FILE_SIZE_BYTES } from '@/shared/lib/constants.js';
import { addPhoto, updatePhoto, deletePhoto } from '@/features/photos/services/photos.service.js';
import { addPhotoSchema, validateFrontend } from '@/shared/utils/validators.js';
import { cn } from '@/shared/utils';

const MIN_SLOTS = 3;

export function PhotoManager({ photos = [], onChange }) {
  const { toast } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmPhoto, setConfirmPhoto] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (photo) => {
    setEditing(photo);
    setFormOpen(true);
  };
  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditing(null);
  };

  const remaining = Math.max(0, MAX_PHOTOS - photos.length);
  const full = remaining <= 0;
  const slotCount = full ? 0 : Math.max(MIN_SLOTS - photos.length, 1);

  const handleAdd = async (file, { title, description }) => {
    if (!file) return { ok: false };
    if (!ALLOWED_MIME.includes(file.type)) {
      toast({ message: 'Format non autorisé : seulement JPG ou PNG.', type: 'error' });
      return { ok: false };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({ message: 'Fichier trop volumineux (max 5 Mo).', type: 'error' });
      return { ok: false };
    }
    if (photos.length >= MAX_PHOTOS) {
      toast({ message: 'Limite de 10 photos atteinte.', type: 'error' });
      return { ok: false };
    }
    setSubmitting(true);
    try {
      const created = await addPhoto(file, { title, description });
      onChange?.([...photos, created]);
      toast({ message: 'Photo ajoutée avec succès.', type: 'success' });
      setFormOpen(false);
      setEditing(null);
      return { ok: true };
    } catch (err) {
      const fieldErrors = err?.errors
        ? Object.fromEntries(Object.entries(err.errors).filter(([k]) => ['title', 'description'].includes(k)))
        : {};
      if (Object.keys(fieldErrors).length) return { ok: false, errors: fieldErrors };
      toast({
        message: err?.errors?.photo || err?.message || "Erreur lors de l'ajout de la photo.",
        type: 'error',
      });
      return { ok: false };
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async ({ title, description }) => {
    if (!editing) return { ok: false };
    setSubmitting(true);
    try {
      const updated = await updatePhoto(editing.id, { title, description });
      onChange?.(photos.map((p) => (p.id === updated.id ? updated : p)));
      toast({ message: 'Photo mise à jour.', type: 'success' });
      setFormOpen(false);
      setEditing(null);
      return { ok: true };
    } catch (err) {
      const fieldErrors = err?.errors
        ? Object.fromEntries(Object.entries(err.errors).filter(([k]) => ['title', 'description'].includes(k)))
        : {};
      if (Object.keys(fieldErrors).length) return { ok: false, errors: fieldErrors };
      toast({ message: err?.message || 'Erreur lors de la mise à jour de la photo.', type: 'error' });
      return { ok: false };
    } finally {
      setSubmitting(false);
    }
  };

  const submitForm = (file, fields) => (editing ? handleUpdate(fields) : handleAdd(file, fields));

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
    <>
      <div className="mb-8 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Photos de réalisations</h2>
          <p className="text-sm text-gray-500">
            Ajoutez jusqu'à <b>{MAX_PHOTOS}</b> photos (JPG ou PNG, 5 Mo max). Une vignette est générée automatiquement.
          </p>
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-xs font-semibold',
            full ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-primary-50 text-primary-700 ring-1 ',
          )}
        >
          {photos.length}/{MAX_PHOTOS}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p) => {
          const isDeleting = deletingId === p.id;
          const title = p.title || p.caption;
          return (
            <Card
              key={p.id}
              className={cn('relative overflow-hidden', isDeleting && 'opacity-60')}
            >
              <div className="relative h-80 w-full overflow-hidden bg-gray-100">
                <img
                  src={p.thumbUrl || p.url}
                  alt={title || ''}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {(title || p.description) && (
                  <FloatingCaption
                    wide
                    title={title || 'Photo de réalisation'}
                    subtitle={p.description}
                    subtitleClassName="line-clamp-2"
                    className="pointer-events-none"
                  />
                )}
                {isDeleting && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-xs font-semibold text-white">
                    Suppression...
                  </div>
                )}
              </div>
              <div className="absolute right-2 top-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(p)}
                  disabled={isDeleting}
                  title="Modifier"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-gray-700 shadow-md transition hover:bg-gray-100 focus-ring disabled:opacity-50"
                  aria-label="Modifier cette photo"
                >
                  <Pencil size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmPhoto(p)}
                  disabled={isDeleting}
                  title="Supprimer"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow-md transition hover:bg-rose-50 focus-ring disabled:opacity-50"
                  aria-label="Supprimer cette photo"
                >
                  <Trash size={16} aria-hidden />
                </button>
              </div>
            </Card>
          );
        })}

        {Array.from({ length: slotCount }, (_, index) => (
          <AddPhotoSlot
            key={`slot-${index}`}
            slotNumber={photos.length + index + 1}
            slotCount={slotCount}
            onClick={openAdd}
          />
        ))}
      </div>

      <PhotoFormModal
        key={editing ? `edit-${editing.id}` : 'add'}
        open={formOpen}
        photo={editing}
        onClose={closeForm}
        onSubmit={submitForm}
        submitting={submitting}
        remaining={remaining}
      />

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
    </>
  );
}

/** Carte */
function AddPhotoSlot({ slotNumber, slotCount, onClick }) {
  return (
    <button type="button" onClick={onClick} className="group h-full text-left focus-ring" aria-label={`Ajouter une photo - emplacement ${slotNumber}`}>
      <Card className="relative flex h-full flex-col overflow-hidden">
        <span className="relative block h-80 w-full overflow-hidden bg-gray-100">
          <span className="absolute inset-3 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white/80 text-center transition group-hover:border-primary-400 group-hover:bg-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <ImagePlus size={20} aria-hidden />
            </span>
            <span className="text-sm font-semibold text-gray-800">Ajouter une photo</span>
            <span className="text-xs text-gray-500">JPG/PNG · 5 Mo</span>
          </span>
          <FloatingCaption
            wide
            icon={ImagePlus}
            title={`Emplacement ${slotNumber}`}
            subtitle={`${slotCount} emplacement${slotCount > 1 ? 's' : ''} vide${slotCount > 1 ? 's' : ''} · cliquez pour ouvrir le formulaire`}
            className="pointer-events-none"
          />
        </span>
      </Card>
    </button>
  );
}

function PhotoFormModal({ open, photo, onClose, onSubmit, submitting, remaining }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(photo?.title || photo?.caption || '');
  const [description, setDescription] = useState(photo?.description || '');
  const [errors, setErrors] = useState({});

  const reset = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setErrors({});
  };

  const close = () => {
    if (submitting) return;
    onClose?.();
    reset();
  };

  const submit = async (e) => {
    e?.preventDefault?.();
    const check = validateFrontend(addPhotoSchema, { title, description });
    if (!check.success) {
      setErrors(check.errors);
      return;
    }
    if (!photo && !file) {
      setErrors({ file: 'Choisissez une image' });
      return;
    }
    setErrors({});
    const res = await onSubmit(photo ? null : file, {
      title: check.data.title,
      description: check.data.description,
    });
    if (res?.ok) reset();
    else if (res?.errors) setErrors((prev) => ({ ...prev, ...res.errors }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-lg p-5" onClose={close}>
        <DialogHeader>
          <DialogTitle>{photo ? 'Modifier la photo' : 'Ajouter une photo'}</DialogTitle>
          <DialogDescription>
            {photo ? (
              'Modifiez le titre et la description de cette réalisation. L\'image reste inchangée.'
            ) : (
              <>
                Image, titre et description de votre réalisation · {remaining} emplacement
                {remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
          {!photo && (
            <div>
              <FileUpload
                label={file ? "Changer l'image" : 'Choisir une image'}
                hint="JPG ou PNG · 5 Mo maximum"
                value={file}
                onChange={(next) => {
                  setFile(next);
                  if (next) setErrors((prev) => ({ ...prev, file: undefined }));
                }}
                capture="environment"
                disabled={submitting}
              />
              {errors.file && <p role="alert" className="mt-1 text-xs text-danger-500">{errors.file}</p>}
            </div>
          )}

          <FormField
            id="ap-title"
            label="Titre"
            required
            error={errors.title}
            help="3 à 100 caractères"
            counter={
              <span className={title.length < 3 || title.length > 100 ? 'text-danger-500 font-semibold' : ''}>
                {title.length}/100
              </span>
            }
          >
            <Input
              id="ap-title"
              placeholder="Ex : Réparation d'une fuite cuisine"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              maxLength={100}
              disabled={submitting}
            />
          </FormField>

          <FormField
            id="ap-description"
            label="Description"
            required
            as="textarea"
            error={errors.description}
            help="10 à 500 caractères : décrivez le contexte, la prestation, le résultat."
            counter={
              <span className={description.length < 10 || description.length > 500 ? 'text-danger-500 font-semibold' : ''}>
                {description.length}/500
              </span>
            }
          >
            <Textarea
              id="ap-description"
              rows={3}
              placeholder="Ex : Intervention le jour même, changement du siphon et test d'étanchéité complet."
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              maxLength={500}
              disabled={submitting}
            />
          </FormField>

          <DialogFooter>
            <Button type="button" variant="ghost" size="md" onClick={close} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" size="md" loading={submitting}>
              {photo ? 'Enregistrer' : 'Publier la photo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
