import { useEffect, useState } from 'react';
import { Phone, Users } from 'lucide-react';
import { getMyContacts } from '../services/contacts.service.js';
import { Card } from '@/components/ui/Card.jsx';
import { Skeleton } from '@/components/ui/Skeleton.jsx';
import { EmptyState } from '@/components/ui/EmptyState.jsx';
import { UserAvatar } from '@/components/ui/UserAvatar.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { formatPhoneFR } from '@/lib/utils.js';

function ContactRow({ contact }) {
  const name = contact.displayName || 'Utilisateur';
  return (
    <li>
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              user={{ firstName: contact.firstName, lastName: contact.lastName }}
              src={contact.avatarUrl}
              name={name}
              className="h-11 w-11"
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{name}</p>
              <p className="truncate text-xs text-gray-500">
                {contact.tradeName || (contact.role === 'professional' ? 'Professionnel' : 'Client')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={contact.outgoing ? 'info' : 'primary'} size="sm">
              {contact.outgoing ? 'Contacté' : 'Vous a contacté'}
            </Badge>
            {!contact.outgoing && contact.status === 'new' && (
              <Badge variant="warning" size="sm">Nouveau</Badge>
            )}
          </div>
        </div>

        {contact.message && (
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">{contact.message}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-400">
            {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
          </p>
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary-700 hover:underline"
            >
              <Phone size={14} aria-hidden /> {formatPhoneFR(contact.phone)}
            </a>
          )}
        </div>
      </Card>
    </li>
  );
}

export function ContactsSection() {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getMyContacts()
      .then((data) => { if (!cancelled) setItems(data.items || []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold tracking-tight text-gray-900">Mes contacts</h2>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (items?.length ?? 0) === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun contact pour le moment"
          description="Les clients et les professionnels que vous contactez apparaîtront ici."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((c) => <ContactRow key={c.id} contact={c} />)}
        </ul>
      )}
    </div>
  );
}
