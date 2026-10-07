import { useState } from "react";
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useAuthModal } from '@/shared/context/AuthModalContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { Textarea } from '@/components/ui/Textarea.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { useForm } from '@/components/form/useForm.js';
import { becomeProfessionalSchema } from '@/components/form/validators.js';
import { becomeProfessional } from '../services/auth.service.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { ROUTES } from '@/lib/constants.js';
import { MultiSelect } from "@/components/ui/MultiSelect.jsx";

const INITIAL = { displayName: '', tradeId: '', zoneIds: [], yearsExperience: '', description: '' };
const STEP1_FIELDS = { displayName: true, tradeId: true, zoneIds: true };

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
    } else if (res.error?.message)
      toast({ message: res.error.message, type: 'error' });

  };

  return (
    <Card className={bare ? 'p-6 border-0 shadow-none' : 'p-6 sm:p-8'}>
      <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Faites connaître votre métier.</h1>
      <p className="mt-1 text-sm text-gray-500">
        Commencez par l'essentiel. Vous compléterez votre profil ensuite.
      </p>
      {loadingRefs && (
        <div className="mt-6 space-y-3" aria-busy="true">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      )}
      <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate hidden={loadingRefs}>
        {step === 1 && (
          <>
            <FormField
              id="bp-display"
              label="Nom affiché (votre nom plus le grand public)"
              required
              error={errors.displayName}
              placeholder="Ex : Plomberie Makélékélé Services"
              help="1 à 100 caractères"
              counter={
                <span className={(values.displayName || '').length > 100 ? 'text-danger-500 font-semibold' : ''}>
                  {(values.displayName || '').length}/100
                </span>
              }
              value={values.displayName}
              onChange={(e) => setField('displayName', e.target.value.slice(0, 100))}
            />
            <FormField id="bp-trade" label="Métier" required error={errors.tradeId} as="select">
              <Select
                id="bp-trade"
                name="tradeId"
                className="border border-gray-200 "
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
            <MultiSelect
              label="Zone"
              required
              hint="Sélectionnez au moins une zone."
              error={errors.zoneIds}
              options={zones.map((z) => ({ value: z.id, label: z.name }))}
              value={values.zoneIds || []}
              onChange={(ids) => setField('zoneIds', ids)}
            />
            <Button type="button" onClick={goNext} size="lg" className="w-full">
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
              help="Indiquez vos années d'expérience"
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
                error={errors.yearsExperience}
              />
            </FormField>
            <FormField
              id="bp-description"
              label="Description"
              required
              error={errors.description}
              help="30 à 500 caractères : décrivez vos services, votre secteur, votre expérience."
              counter={
                <span className={(values.description || '').length < 30 || (values.description || '').length > 500 ? 'text-danger-500 font-semibold' : ''}>
                  {(values.description || '').length}/500
                </span>
              }
              as="textarea"
            >
              <Textarea
                id="bp-description"
                rows={3}
                value={values.description}
                onChange={(e) => setField('description', e.target.value.slice(0, 500))}
                placeholder="Décrivez vos services, votre secteur, votre expérience..."
              />
            </FormField>
            <div className="flex items-center gap-3">
              <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)} className="w-1/2">
                Précédent
              </Button>
              <Button type="submit" loading={submitting} size="lg" className="w-1/2">
                Valider
              </Button>
            </div>
          </>
        )}
      </form>
    </Card>
  );
}
