import { useState } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { Checkbox } from '@/components/ui/Checkbox.jsx';
import { Textarea } from '@/components/ui/Textarea.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Spinner } from '@/components/ui/Spinner.jsx';
import { useForm } from '@/components/form/useForm.js';
import { becomeProfessionalSchema } from '@/components/form/validators.js';
import { becomeProfessional } from '../services/auth.service.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { ROUTES } from '@/lib/constants.js';

const INITIAL = { displayName: '', tradeId: '', zoneIds: [], yearsExperience: '', description: '' };
const STEP1_FIELDS = { displayName: true, tradeId: true, zoneIds: true };

function toggleZone(list, id, on) {
  const n = Number(id);
  if (on) return Array.from(new Set([...list, n]));
  return list.filter((z) => z !== n);
}

export function BecomeProForm({ bare = false } = {}) {
  const { refresh } = useAuthContext();
  const { close: closeModal } = useAuthModal();
  const navigate = useNavigate();
  const { toast } = useNotification();
  const { trades, zones, loading: loadingRefs } = useReferenceData();
  const [step, setStep] = useState(1);

  const { values, errors, submitting, setField, handleSubmit, setErrors } = useForm(
    becomeProfessionalSchema,
    INITIAL,
    async (data) => becomeProfessional(data),
  );

  const goNext = () => {
    const r = becomeProfessionalSchema.pick(STEP1_FIELDS).safeParse(values);
    if (!r.success) {
      const fe = z.flattenError(r.error).fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v[0]])));
      return;
    }
    setErrors({});
    setStep(2);
  };

  const onSubmit = async (e) => {
    const res = await handleSubmit(e);
    if (res.ok) {
      toast({ message: 'Votre compte est maintenant professionnel !', type: 'success' });
      closeModal();
      await refresh();
      navigate(ROUTES.DASHBOARD_PRO, { replace: true });
    } else if (res.error?.errors) {
      setErrors((prev) => ({ ...prev, ...res.error.errors }));
      toast({ message: res.error.message || 'Veuillez corriger les erreurs.', type: 'error' });
    } else if (res.error?.message) {
      toast({ message: res.error.message, type: 'error' });
    }
  };

  return (
    <Card className={bare ? 'p-0 border-0 shadow-none' : 'p-6 sm:p-8'}>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Devenir prestataire</h1>
      <p className="mt-1 text-sm text-gray-500">
        Étape {step}/2 — complétez votre profil professionnel.
      </p>
      {loadingRefs && (
        <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
          <Spinner /> Chargement des métiers et zones...
        </div>
      )}
      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate hidden={loadingRefs}>
        {step === 1 && (
          <>
            <FormField
              id="bp-display"
              label="Nom affiché"
              required
              error={errors.displayName}
              placeholder="Ex : Plomberie Makélékélé Services"
              value={values.displayName}
              onChange={(e) => setField('displayName', e.target.value)}
            />
            <FormField id="bp-trade" label="Métier" required error={errors.tradeId} as="select">
              <Select
                id="bp-trade"
                name="tradeId"
                value={values.tradeId}
                error={errors.tradeId}
                onChange={(e) => setField('tradeId', e.target.value)}
              >
                <option value="">Choisissez un métier</option>
                {trades.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </FormField>
            <FormField
              id="bp-zones"
              label="Zone"
              required
              error={errors.zoneIds}
              help="Sélectionnez au moins une zone."
            >
              <ul className="grid gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3">
                {zones.map((z) => {
                  const checked = values.zoneIds?.includes?.(z.id);
                  return (
                    <li key={z.id}>
                      <Checkbox
                        id={`bp-zone-${z.id}`}
                        label={z.name}
                        checked={checked}
                        onChange={(e) =>
                          setField('zoneIds', toggleZone(values.zoneIds || [], z.id, e.target.checked))
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </FormField>
            <Button type="button" onClick={goNext} size="lg" className="w-full sm:w-auto sm:px-8">
              Suivant
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <FormField
              id="bp-years"
              label="Années d'expérience"
              required
              error={errors.yearsExperience}
              help="Entre 0 et 60 ans"
              as="input"
            >
              <Input
                id="bp-years"
                type="number"
                min="0"
                max="60"
                value={values.yearsExperience}
                onChange={(e) => setField('yearsExperience', e.target.value)}
                placeholder="Ex : 5"
              />
            </FormField>
            <FormField
              id="bp-description"
              label="Description"
              required
              error={errors.description}
              help="30 caractères minimum, 500 maximum"
              as="textarea"
            >
              <Textarea
                id="bp-description"
                rows={5}
                value={values.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Décrivez vos services, votre secteur, votre expérience..."
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button type="submit" loading={submitting} size="lg" className="sm:px-8">
                Valider
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
}
