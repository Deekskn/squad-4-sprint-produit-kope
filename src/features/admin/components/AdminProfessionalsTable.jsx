import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Input, Pagination, Modal, DataState } from '@/components/ui/index.js';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { listPros, setProHidden } from '../services/admin.service.js';
import { PROFILE_STATUS, PROFILE_STATUS_LABELS, ROUTES } from '@/lib/constants.js';
import { formatDateFr, initials } from '@/lib/utils.js';

const PAGE_SIZE = 20;

function statusVariant(s) {
  if (s === PROFILE_STATUS.PUBLISHED) return 'success';
  if (s === PROFILE_STATUS.HIDDEN) return 'danger';
  return 'warning';
}

export function AdminProfessionalsTable() {
  const { toast } = useNotification();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null); 

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPros({ page, pageSize: PAGE_SIZE, query: search }));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    load();
  }, [load]);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setProHidden(confirm.item.userId || confirm.item.id, confirm.action === 'hide');
      toast({
        message: confirm.action === 'hide' ? 'Profil masqué.' : 'Profil réactivé.',
        type: 'success',
      });
      setConfirm(null);
      load();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    }
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(query.trim());
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
        <div className="max-w-sm flex-1">
          <Input
            placeholder="Rechercher un professionnel par nom, entreprise, ou téléphone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" size="md" variant="outline">Rechercher</Button>
      </form>

      <DataState loading={loading} error={error}>
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Professionnel</TableHead>
                <TableHead>Métier</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data?.items || []).length === 0 ? (
                <TableEmpty colSpan={5}>Aucun résultat.</TableEmpty>
              ) : (
                (data?.items || []).map((p) => {
                  const id = p.userId || p.id;
                  const name = p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || `#${id}`;
                  return (
                    <TableRow key={id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800 ring-1 ring-primary-200">
                            {initials(p.firstName || '', p.lastName || p.displayName || '')}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">{name}</p>
                            {p.phone && <p className="text-xs text-gray-500">{p.phone}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{p.trade || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(p.status)}>
                          {PROFILE_STATUS_LABELS[p.status] || p.status || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {p.createdAt ? formatDateFr(p.createdAt) : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            as={Link}
                            to={ROUTES.PROFESSIONAL(id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="xs"
                            variant="ghost"
                          >
                            Fiche
                          </Button>
                          {p.status === PROFILE_STATUS.HIDDEN ? (
                            <Button size="xs" variant="outline" onClick={() => setConfirm({ item: p, action: 'show' })}>
                              Réactiver
                            </Button>
                          ) : (
                            <Button size="xs" variant="danger-outline" onClick={() => setConfirm({ item: p, action: 'hide' })}>
                              Masquer
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          {(data?.total ?? 0) > PAGE_SIZE && (
            <Pagination
              page={Number(data?.page || page)}
              pageSize={Number(data?.pageSize || PAGE_SIZE)}
              total={Number(data?.total || 0)}
              onPageChange={setPage}
            />
          )}
        </>
      </DataState>

      <Modal
        open={!!confirm}
        onClose={() => !confirm?.loading && setConfirm(null)}
        dismissable={!confirm?.loading}
        title={confirm?.action === 'hide' ? 'Masquer le profil ?' : 'Réactiver le profil ?'}
        description={
          confirm
            ? confirm.action === 'hide'
              ? 'Le profil disparaîtra des recherches et de la fiche publique. Vous pouvez le réactiver à tout moment.'
              : 'Le profil sera à nouveau visible dans les recherches et sa fiche publique sera réouverte.'
            : ''
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={!!confirm?.loading}>
              Annuler
            </Button>
            <Button
              variant={confirm?.action === 'hide' ? 'danger' : 'primary'}
              onClick={apply}
              loading={!!confirm?.loading}
            >
              {confirm?.action === 'hide' ? 'Masquer' : 'Réactiver'}
            </Button>
          </>
        }
      />
    </div>
  );
}
