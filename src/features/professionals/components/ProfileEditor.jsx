import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button.jsx';
import { FormField } from '@/components/ui/FormField.jsx';
import { Textarea } from '@/components/ui/Textarea.jsx';
import { Checkbox } from '@/components/ui/Checkbox.jsx';
import { Card } from '@/components/ui/Card.jsx';
import { useForm } from '@/components/form/useForm.js';
import { updateProfileSchema } from '@/components/form/validators.js';
import { useReferenceData } from '@/features/reference/hooks/useReferenceData.js';
import { updateMyProfile } from '../services/professionals.service.js';
import { useNotification } from '@/shared/context/NotificationContext.jsx';

const DESC_MIN = 30;
const DESC_MAX = 500;

function toggleZone(list, id, on) {
  const n = Number(id);
  if (on) return Array.from(new Set([...list, n]));
  return list.filter((z) => z !== n);
}

function extractInitial(profile) {
  return {
    description: profile?.description ?? '',
    yearsExperience: profile?.yearsExperience ?? '',
    whatsapp: profile?.whatsapp ?? '',
    zoneIds: profile?.zones?.map((z) => Number(z.id ?? z))?.filter(Boolean) ?? profile?.zoneIds ?? [],
  };
}

export function ProfileEditor({ profile, onUpdated }) {
  const { zones, loading: loadingRefs } = useReferenceData();
  const { toast } = useNotification();

  const initial = useMemo(() => extractInitial(profile), [profile]);

  const { values, errors, submitting, setField, handleSubmit, setErrors } = useForm(
    updateProfileSchema,
    initial,
    async (data) => updateMyProfile(data),
  );

  useEffect(() => {
    // Keep values in sync when profile data loads or resets externally
  }, [initial]);

  const onSubmit = async (e) => {
    const res = await handleSubmit(e);
    if (res.ok) {
      toast({ message: 'Profil mis à jour avec succès.', type: 'success' });
      onUpdated?.(res.result);
    } else if (res.error?.errors) {
      setErrors((prev) => ({ ...prev, ...res.error.errors }));
      toast({ message: res.error.message || 'Erreur de validation.', type: 'error' });
    } else if (res.error?.message) {
      toast({ message: res.error.message, type: 'error' });
    }
  };

  const descLen = String(values.description ?? '').length;

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Informations professionnelles</h2>
          <p className="text-sm text-gray-500">
            Ces informations apparaissent sur votre fiche publique.
          </p>
        </div>
      </div>
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormField
          id="pe-desc"
          label="Description de votre activité"
          required
          as="textarea"
          error={errors.description}
          help={
            <>Entre <b>{DESC_MIN}</b> et <b>{DESC_MAX}</b> caractères · <span className={descLen < DESC_MIN || descLen > DESC_MAX ? 'text-danger-500 font-semibold' : ''}>{descLen}/{DESC_MAX}</span></>
          }
        >
          <Textarea
            id="pe-desc"
            rows={6}
            placeholder="Présentez votre activité, vos services, vos horaires, vos garanties..."
            value={values.description}
            onChange={(e) => setField('description', e.target.value.slice(0, DESC_MAX + 10))}
            error={errors.description}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="pe-years"
            label="Années d'expérience"
            required
            error={errors.yearsExperience}
            type="number"
            min={0}
            max={60}
            step={1}
            help="Entier entre 0 et 60"
            value={values.yearsExperience}
            onChange={(e) => setField('yearsExperience', e.target.value)}
          />
          <FormField
            id="pe-whatsapp"
            label="Numéro WhatsApp"
            error={errors.whatsapp}
            placeholder="+242... (laissez vide pour utiliser votre numéro de compte)"
            value={values.whatsapp}
            onChange={(e) => setField('whatsapp', e.target.value)}
            inputMode="tel"
          />
        </div>

        <FormField
          id="pe-zones"
          label="Zones d'intervention"
          required
          error={errors.zoneIds}
          help="Cochez au moins une zone"
        >
          <fieldset disabled={loadingRefs} className="grid gap-1.5 rounded-xl border border-gray-200 bg-gray-50 p-3 sm:grid-cols-3">
            {loadingRefs ? (
              <div className="col-span-full text-sm text-gray-500">Chargement des zones...</div>
            ) : (
              zones.map((z) => (
                <Checkbox
                  key={z.id}
                  id={`pe-zone-${z.id}`}
                  label={z.name}
                  checked={(values.zoneIds || []).includes?.(z.id)}
                  onChange={(e) =>
                    setField('zoneIds', toggleZone(values.zoneIds || [], z.id, e.target.checked))
                  }
                />
              ))
            )}
          </fieldset>
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="submit" loading={submitting} size="lg">
            Enregistrer les modifications
          </Button>
        </div>
      </form>
    </Card>
  );
}
