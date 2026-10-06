import { useState } from 'react';
import { createReview } from '../services/reviews.service.js';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Textarea } from '@/components/ui/Textarea.jsx';
import { StarInput } from '@/components/ui/StarRating.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Card } from '@/components/ui/Card.jsx';

const MAX = 300;

export function ReviewForm({ professionalId, onSuccess }) {
  const { toast } = useNotification();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!rating || rating < 1 || rating > 5) {
      setError('Donnez une note entre 1 et 5 étoiles.');
      return;
    }
    if (comment.length > MAX) {
      setError(`Commentaire limité à ${MAX} caractères.`);
      return;
    }
    setSubmitting(true);
    try {
      await createReview(professionalId, { rating: Number(rating), comment: comment.trim() || null });
      toast({ message: 'Merci, votre avis a été publié.', type: 'success' });
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.errors?.rating || err?.errors?.comment || err?.message || "Impossible d'enregistrer votre avis.";
      setError(msg);
      toast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 sm:p-7">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <div>
          <label className="mb-2 block text-sm font-bold text-gray-900">Note *</label>
          <StarInput value={rating} onChange={setRating} size="lg" count={5} />
        </div>
        <FormField
          id="rv-comment"
          label="Votre commentaire"
          help={`Facultatif · 0 à ${MAX} caractères`}
          counter={
            <span className={comment.length > MAX ? 'text-danger-500 font-semibold' : ''}>
              {comment.length}/{MAX}
            </span>
          }
          as="textarea"
        >
          <Textarea
            id="rv-comment"
            rows={3}
            placeholder="Parlez de votre expérience avec ce professionnel..."
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, MAX + 10))}
          />
        </FormField>

        {error && (
          <div role="alert" className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button type="submit" loading={submitting} size="lg">
            Publier mon avis
          </Button>
        </div>
      </form>
    </Card>
  );
}
