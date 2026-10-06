import { useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Textarea } from '@/components/ui/Textarea.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { FileUpload } from '@/components/ui/FileUpload.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { FloatingCaption } from '@/components/ui/FloatingCaption.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { MAX_PHOTOS, ALLOWED_MIME, MAX_FILE_SIZE_BYTES } from '@/lib/constants.js';
import { addPhoto, deletePhoto } from '@/features/photos/services/photos.service.js';
import { addPhotoSchema, validateFrontend } from '@/components/form/validators.js';
import { cn } from '@/lib/utils.js';

const MIN_SLOTS = 3;

export function PhotoManager({ photos = [], onChange }) {
  const { toast } = useNotification();
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmPhoto, setConfirmPhoto] = useState(null);
  const [addOpen, setAddOpen] = useState(false);

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
      setAddOpen(false);
      return { ok: true };
    } catch (err) {
      // Erreurs de champ renvoyées par le serveur (titre / description) : affichées dans le modal.
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
          const title = p.title || p.caption;
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
                alt={title || ''}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <figcaption className="bg-white/90 px-3 py-2 text-xs text-gray-700 ring-1 ring-gray-100 min-h-[42px]">
                <p className="font-semibold text-gray-900">{title || <span className="text-gray-400 italic">Sans titre</span>}</p>
                {p.description && <p className="mt-0.5 line-clamp-2 text-gray-500">{p.description}</p>}
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

        {Array.from({ length: slotCount }, (_, index) => (
          <AddPhotoSlot
            key={`slot-${index}`}
            slotNumber={photos.length + index + 1}
            remaining={remaining}
            onClick={() => setAddOpen(true)}
          />
        ))}
      </div>

      <AddPhotoModal
        open={addOpen}
        onClose={() => !submitting && setAddOpen(false)}
        onSubmit={handleAdd}
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
    </Card>
  );
}

/** Carte "emplacement" cliquable : même style que les cartes de la home. */
function AddPhotoSlot({ slotNumber, remaining, onClick }) {
  const remainingLabel = `${remaining} emplacement${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''}`;
  return (
    <button type="button" onClick={onClick} className="group h-full text-left focus-ring" aria-label={`Ajouter une photo — emplacement ${slotNumber}`}>
      <Card className="relative flex h-full flex-col overflow-hidden">
        <span className="relative block aspect-[4/3] w-full overflow-hidden bg-gray-100">
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
            subtitle={`${remainingLabel} · cliquez pour ouvrir le formulaire`}
            className="pointer-events-none"
          />
        </span>
      </Card>
    </button>
  );
}

/** Modal : image + titre + description de la réalisation. */
function AddPhotoModal({ open, onClose, onSubmit, submitting, remaining }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
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
    if (!file) {
      setErrors({ file: 'Choisissez une image' });
      return;
    }
    setErrors({});
    const res = await onSubmit(file, { title: check.data.title, description: check.data.description });
    if (res?.ok) reset();
    else if (res?.errors) setErrors((prev) => ({ ...prev, ...res.errors }));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-lg p-6" onClose={close}>
        <DialogHeader>
          <DialogTitle>Ajouter une photo</DialogTitle>
          <DialogDescription>
            Image, titre et description de votre réalisation · {remaining} emplacement
            {remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} noValidate className="space-y-4">
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

          <FormField id="ap-title" label="Titre" required error={errors.title}>
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
          >
            <Textarea
              id="ap-description"
              rows={4}
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
              Publier la photo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
