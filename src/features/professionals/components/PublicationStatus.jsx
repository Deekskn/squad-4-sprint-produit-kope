import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge.jsx';
import { PROFILE_STATUS, PROFILE_STATUS_LABELS, RG04_CHECKLIST } from '@/lib/constants.js';

const VARIANT = {
  [PROFILE_STATUS.PUBLISHED]: 'success',
  [PROFILE_STATUS.INCOMPLETE]: 'warning',
  [PROFILE_STATUS.HIDDEN]: 'danger',
};

function MissingChecklist({ missing }) {
  if (!missing?.length) return null;
  const items = missing.map((m) => ({
    label: m.label || RG04_CHECKLIST.find((r) => r.code === m.code)?.label || m.code,
  }));
  return (
    <ul className="mt-3 space-y-1.5 text-sm">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-amber-200/60">
          <TriangleAlert size={16} className="mt-0.5" aria-hidden />
          <span>{it.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function PublicationStatus({ status = PROFILE_STATUS.INCOMPLETE, missing = [] }) {
  const variant = VARIANT[status] || 'neutral';
  const label = PROFILE_STATUS_LABELS[status] || status;
  const desc = {
    [PROFILE_STATUS.PUBLISHED]: 'Votre profil apparaît dans les recherches clients.',
    [PROFILE_STATUS.INCOMPLETE]: 'Ajoutez les éléments manquants pour apparaître dans les recherches.',
    [PROFILE_STATUS.HIDDEN]: 'Votre profil a été masqué par un administrateur. Contactez le support pour plus d\'informations.',
  }[status] || '';
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium text-gray-500">Statut de publication</p>
        <Badge variant={variant} size="md">{label}</Badge>
      </div>
      {desc && <p className="mt-2 text-sm text-gray-600">{desc}</p>}
      <MissingChecklist missing={missing} />
    </div>
  );
}
