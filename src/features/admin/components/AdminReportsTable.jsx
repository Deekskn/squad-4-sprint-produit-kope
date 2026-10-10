import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Check, Flag, X } from 'lucide-react';
import {
  Button,
  CustomSelect,
  SearchInput,
  Pagination,
  DataState,
  Tooltip,
  UserAvatar,
} from '@/shared/components/ui';
import { AdminFilterGroup, AdminFilterPanel, AdminSectionLayout } from './AdminSectionLayout.jsx';
import { AdminConfirmModal } from './AdminConfirmModal.jsx';
import { useAdminPage } from '../hooks/useAdminPage.js';
import { useAdminFilters } from '../hooks/useAdminFilters.js';
import { useAdminList } from '../hooks/useAdminList.js';
import { useAuthContext } from '@/shared/context/AuthContext.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { listReports, setReportStatus, setUserBlocked, setUserSuspended } from '../services/admin.service.js';
import { REPORT_STATUS_OPTIONS, reportReasonLabel, reportStatusLabel } from '@/shared/constants/reports.js';
import { ROUTES } from '@/shared/lib/constants.js';
import { formatDateFr, fullNameInitials } from '@/shared/utils';

const PAGE_SIZE = 20;

const STATUS_BADGES = {
  pending: 'bg-amber-100 text-amber-800',
  resolved: 'bg-mint-100 text-primary-700',
  dismissed: 'bg-gray-100 text-gray-600',
};

function ReportRow({ report, onResolve, onDismiss }) {
  return (
    <li className="space-y-2 rounded-sm bg-gray-50/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-700 ring-1 ring-gray-200">
          <Flag size={11} aria-hidden />
          {reportReasonLabel(report.reason)}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGES[report.status]}`}>
          {reportStatusLabel(report.status)}
        </span>
      </div>

      {report.message && (
        <p className="whitespace-pre-wrap border-l-2 border-primary-300 pl-3 text-sm leading-6 text-gray-700">
          {report.message}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <UserAvatar user={report.reporter} className="h-5 w-5" iconSize={11} />
          <span className="text-xs text-gray-500">
            {fullNameInitials(report.reporter?.firstName, report.reporter?.lastName) || 'Client'}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={11} aria-hidden />
            {formatDateFr(report.createdAt)}
          </span>
        </div>

        {report.status === 'pending' && (
          <div className="flex gap-1">
            <Button size="icon-sm" variant="ghost" onClick={() => onDismiss(report)} aria-label="Rejeter le signalement">
              <X className="h-3.5 w-3.5 text-rose-600" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onResolve(report)}
              aria-label="Marquer le signalement comme traité"
            >
              <Check className="h-3.5 w-3.5 text-primary-600" />
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

export function AdminReportsTable({ rightContainer = null }) {
  const { user: currentUser } = useAuthContext();
  const { toast } = useNotification();
  const [page, changePage, setPage] = useAdminPage();
  const [confirm, setConfirm] = useState(null);
  const [unblock, setUnblock] = useState(null);
  const [unsuspend, setUnsuspend] = useState(null);
  const [saving, setSaving] = useState(false);
  const { draft, applied, dirty, set, submit, reset } = useAdminFilters({ query: '', status: '' });

  const fetchList = useCallback(
    () => listReports({ page, pageSize: PAGE_SIZE, status: applied.status || undefined, query: applied.query }),
    [page, applied.status, applied.query],
  );
  const { data, loading, error, reload } = useAdminList(fetchList);

  const apply = async () => {
    if (!confirm) return;
    try {
      await setReportStatus(confirm.item.id, confirm.action === 'resolve' ? 'resolved' : 'dismissed');
      toast({
        message: confirm.action === 'resolve' ? 'Signalement marqué comme traité.' : 'Signalement rejeté.',
        type: 'success',
      });
      setConfirm(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    }
  };

  const applyUnblock = async () => {
    if (!unblock) return;
    setSaving(true);
    try {
      await setUserBlocked(currentUser?.id, unblock.id, false);
      toast({ message: 'Compte débloqué.', type: 'success' });
      setUnblock(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const applyUnsuspend = async () => {
    if (!unsuspend) return;
    setSaving(true);
    try {
      await setUserSuspended(currentUser?.id, unsuspend.id, false);
      toast({ message: 'Suspension levée, le compte est à nouveau actif.', type: 'success' });
      setUnsuspend(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const applyFilters = () => {
    setPage(1);
    submit();
  };

  const resetFilters = () => {
    reset();
    setPage(1);
  };

  const total = Number(data?.total || 0);

  const renderFilters = (searchId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={applyFilters} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <SearchInput
            id={searchId}
            value={draft.query}
            onChange={(e) => set('query', e.target.value)}
            onClear={() => set('query', '')}
            placeholder="Professionnel, auteur ou contenu..."
            aria-label="Rechercher un signalement"
          />
        </AdminFilterGroup>

        <AdminFilterGroup title="Statut">
          <CustomSelect
            value={draft.status}
            onChange={(v) => {
              set('status', v, { immediate: true });
              setPage(1);
            }}
            options={REPORT_STATUS_OPTIONS}
            className="w-full"
            aria-label="Filtrer par statut"
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const list = (
    <DataState loading={loading} error={error}>
      <>
        <ul className="space-y-3">
          {(data?.items || []).length === 0 ? (
            <li className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-500">
              Aucun signalement.
            </li>
          ) : (
            (data?.items || []).map((group) => (
              <li
                key={group.professionalId}
                className={`overflow-hidden rounded-lg border bg-white ${
                  group.pendingCount > 0 ? 'border-amber-200' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/70 px-4 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <UserAvatar
                      src={group.professionalAvatarUrl}
                      name={group.professionalName}
                      className="h-8 w-8 shrink-0"
                      iconSize={14}
                    />
                    <Link
                      to={ROUTES.PROFESSIONAL(group.professionalId)}
                      className="truncate text-sm font-bold text-gray-900 transition hover:text-primary-700 hover:underline"
                    >
                      {group.professionalName || `Pro #${group.professionalId}`}
                    </Link>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {group.professionalSuspendedAt && (
                      <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                        Suspendu
                      </span>
                    )}
                    {group.professionalBlockedAt && !group.professionalSuspendedAt && (
                      <>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          Compte bloqué
                        </span>
                        <Tooltip content="Débloquer ce compte">
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-primary-600 hover:bg-mint-100"
                            onClick={() => setUnblock({ id: group.professionalId, name: group.professionalName })}
                            aria-label={`Débloquer le compte de ${group.professionalName}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        </Tooltip>
                      </>
                    )}
                    {group.professionalSuspendedAt && (
                      <Tooltip content="Lever la suspension">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-primary-600 hover:bg-mint-100"
                          onClick={() => setUnsuspend({ id: group.professionalId, name: group.professionalName })}
                          aria-label={`Lever la suspension de ${group.professionalName}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    )}
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-gray-600 ring-1 ring-gray-200">
                      {group.reportCount} signalement{group.reportCount > 1 ? 's' : ''}
                    </span>
                    {group.pendingCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        {group.pendingCount} en attente
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 p-3">
                  {(group.reports || []).map((report) => (
                    <ReportRow
                      key={report.id}
                      report={report}
                      onResolve={(item) => setConfirm({ item, action: 'resolve' })}
                      onDismiss={(item) => setConfirm({ item, action: 'dismiss' })}
                    />
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
        <Pagination
          page={Number(data?.page || page)}
          pageSize={Number(data?.pageSize || PAGE_SIZE)}
          total={total}
          onPageChange={changePage}
          variant="summary"
          className="mt-4"
        />
      </>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={total}
      noun="Signalement"
      nounPlural="Signalements"
      dirty={dirty}
      filters={renderFilters}
      searchId="rep-search"
    >
      {list}

      <AdminConfirmModal
        open={Boolean(confirm)}
        onCancel={() => setConfirm(null)}
        onConfirm={apply}
        danger={confirm?.action === 'dismiss'}
        title={confirm?.action === 'resolve' ? 'Marquer ce signalement comme traité ?' : 'Rejeter ce signalement ?'}
        description={
          confirm?.action === 'resolve'
            ? 'Le signalement sera archivé et retiré de la file en attente.'
            : 'Le signalement sera rejeté. Le profil ne sera pas sanctionné.'
        }
        confirmLabel={confirm?.action === 'resolve' ? 'Marquer traité' : 'Rejeter'}
      />

      <AdminConfirmModal
        open={Boolean(unblock)}
        onCancel={() => setUnblock(null)}
        onConfirm={applyUnblock}
        saving={saving}
        title="Débloquer ce compte ?"
        description={unblock ? `${unblock.name} pourra de nouveau se connecter. Les signalements resteront visibles.` : ''}
        confirmLabel="Débloquer"
      />

      <AdminConfirmModal
        open={Boolean(unsuspend)}
        onCancel={() => setUnsuspend(null)}
        onConfirm={applyUnsuspend}
        saving={saving}
        title="Lever la suspension ?"
        description={
          unsuspend
            ? `${unsuspend.name} pourra de nouveau se connecter et réapparaîtra dans l'annuaire public.`
            : ''
        }
        confirmLabel="Lever la suspension"
      />
    </AdminSectionLayout>  );
}
