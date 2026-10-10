import { useCallback, useEffect, useState } from 'react';
import { Calendar, GripVertical, Pencil, Plus, Trash2, Users, X } from 'lucide-react';
import { Button, CustomSelect, DataState, Modal, Tooltip } from '@/shared/components/ui';
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { cn, formatDateFr } from '@/shared/utils';
import { groupKeyOf, groupItems, tintFor, usedBy, displayEntries as buildEntries, destinationIndex as entryDestination } from './catalog/catalogUtils.js';
import { InlineInput, PositionBadge } from './catalog/InlineInput.jsx';

export function AdminCatalogBoard({
  rightContainer = null,
  groupLabel = 'groupe',
  groupNoun = 'groupe',
  itemNoun = 'élément',
  itemPlaceholder = 'Nouvel élément',
  allGroupsLabel = 'Tous',
  groupByKey = 'groupId',
  listGroups,
  listItems,
  createGroup,
  updateGroup,
  removeGroup,
  reorderGroups,
  createItem,
  updateItem,
  removeItem,
  reorderItems,
  searchId = 'cat-search',
}) {
  const { toast } = useNotification();
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');

  const [drag, setDrag] = useState(null);
  const [preview, setPreview] = useState(null);
  const [overKey, setOverKey] = useState(null);

  const [newGroup, setNewGroup] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemName, setItemName] = useState('');
  const [confirm, setConfirm] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupsRes, itemsRes] = await Promise.all([listGroups(), listItems()]);
      setGroups(groupsRes?.items ?? groupsRes ?? []);
      setItems(itemsRes?.items ?? itemsRes ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [listGroups, listItems]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
  }, [reload]);

  const visibleItems = items.filter((item) =>
    search ? item.name.toLowerCase().includes(search.toLowerCase()) : true,
  );
  const grouped = groupItems(visibleItems, groups, groupByKey);
  const canReorder = !search && !groupFilter;

  const draggingItem = drag?.kind === 'item' ? items.find((i) => i.id === drag.id) : null;

  const cardsOf = (groupKey) => grouped.get(groupKey) ?? [];

  // L'algorithme de aperçu (trou + clone) et la conversion d'index vivent dans
  // catalogUtils : ils sont purs et testables sans React.
  const displayEntries = (groupKey) => buildEntries(cardsOf(groupKey), draggingItem, preview, groupKey);

  const destinationIndex = (groupKey, entryIndex) => entryDestination(cardsOf(groupKey), entryIndex, draggingItem);


  const showPreview = (groupKey, entryIndex) => {
    if (!canReorder || !draggingItem) return;
    const index = destinationIndex(groupKey, entryIndex);
    if (preview?.key === groupKey && preview?.index === index) return;
    setPreview({ key: groupKey, index });
    setOverKey(groupKey);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    setSearch(query.trim());
  };

  const resetFilters = () => {
    setQuery('');
    setSearch('');
    setGroupFilter('');
  };

  const dirty = Boolean(query || search || groupFilter);

  const renderFilters = (inputId) => (
    <AdminFilterPanel dirty={dirty} onReset={resetFilters}>
      <form onSubmit={submitSearch} className="divide-y divide-gray-100">
        <AdminFilterGroup title="Recherche">
          <div className="flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-3 transition-[border-color,box-shadow] hover:border-gray-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/12">
            <input
              id={inputId}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Rechercher ${itemNoun}...`}
              aria-label={`Rechercher ${itemNoun}`}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Effacer la recherche"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </AdminFilterGroup>

        <AdminFilterGroup title={groupLabel}>
          <CustomSelect
            value={groupFilter}
            onChange={setGroupFilter}
            options={[
              { value: '', label: allGroupsLabel },
              ...groups.map((g) => ({ value: String(g.id), label: g.name })),
            ]}
            className="w-full"
            aria-label={`Filtrer par ${groupLabel.toLowerCase()}`}
          />
        </AdminFilterGroup>
      </form>
    </AdminFilterPanel>
  );

  const failAndReload = (err) => {
    toast({ message: err?.message || 'Erreur.', type: 'error' });
    reload();
  };

  const submitNewGroup = async () => {
    const name = String(newGroup || '').trim();
    if (!name) return;
    setSaving(true);
    try {
      await createGroup({ name });
      setNewGroup(null);
      reload();
    } catch (err) {
      failAndReload(err);
    } finally {
      setSaving(false);
    }
  };

  const commitGroupRename = async (groupId) => {
    const name = String(groupName || '').trim();
    setEditingGroupId(null);
    if (!name) return;
    try {
      await updateGroup(groupId, { name });
      reload();
    } catch (err) {
      failAndReload(err);
    }
  };

  const submitNewItem = async (groupId) => {
    const name = String(drafts[groupId] || '').trim();
    if (!name) return;
    setSaving(true);
    try {
      await createItem({ name, [groupByKey]: groupId });
      setDrafts((prev) => ({ ...prev, [groupId]: '' }));
      setAddingTo(null);
      reload();
    } catch (err) {
      failAndReload(err);
    } finally {
      setSaving(false);
    }
  };

  const commitItemRename = async (itemId) => {
    const name = String(itemName || '').trim();
    setEditingItemId(null);
    if (!name) return;
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    try {
      await updateItem(itemId, { name, [groupByKey]: item[groupByKey] });
      reload();
    } catch (err) {
      failAndReload(err);
    }
  };

  /** Déplace un item dans un groupe, à la position donnée. */
  const dropItem = (itemId, targetKey, index) => {
    const moved = items.find((i) => i.id === itemId);
    if (!moved) return;
    const bucket = items.filter((i) => i.id !== itemId && groupKeyOf(i[groupByKey]) === targetKey);
    const position = Math.max(0, Math.min(index ?? bucket.length, bucket.length));
    bucket.splice(position, 0, { ...moved, [groupByKey]: targetKey });
    const rest = items.filter((i) => i.id !== itemId && groupKeyOf(i[groupByKey]) !== targetKey);
    setItems([...rest, ...bucket]);
    updateItem(itemId, { name: moved.name, [groupByKey]: targetKey })
      .then(() => reorderItems(bucket.map((i) => i.id)))
      .catch(failAndReload);
  };

  /** Déplace un groupe à la position donnée. */
  const dropGroup = (groupId, targetIndex) => {
    const next = [...groups];
    const from = next.findIndex((g) => g.id === groupId);
    if (from < 0) return;
    const [moved] = next.splice(from, 1);
    const to = from < targetIndex ? targetIndex - 1 : targetIndex;
    next.splice(Math.max(0, Math.min(to, next.length)), 0, moved);
    setGroups(next);
    reorderGroups(next.map((g) => g.id)).catch(failAndReload);
  };

  const resetDrag = () => {
    setDrag(null);
    setPreview(null);
    setOverKey(null);
  };

  const handleDrop = (targetKey, entryIndex) => {
    if (!drag) return;
    if (drag.kind === 'group') {
      const groupIndex = groups.findIndex((g) => groupKeyOf(g.id) === targetKey);
      dropGroup(drag.id, groupIndex < 0 ? groups.length : groupIndex);
    } else if (preview && preview.key === targetKey)
      dropItem(drag.id, targetKey, preview.index);
    else dropItem(drag.id, targetKey, destinationIndex(targetKey, entryIndex ?? cardsOf(targetKey).length));
    resetDrag();
  };

  const doDelete = async () => {
    if (!confirm) return;
    setSaving(true);
    try {
      if (confirm.kind === 'group') await removeGroup(confirm.target.id);
      else await removeItem(confirm.target.id);
      toast({
        message: confirm.kind === 'group' ? `${groupNoun} supprimé.` : `${itemNoun} supprimé.`,
        type: 'success',
      });
      setConfirm(null);
      reload();
    } catch (err) {
      toast({ message: err?.message || 'Erreur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const itemFooter = (item) => (
    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {usedBy(item.professionals ?? 0)}
      </span>
      {item.createdAt && (
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Créé le {formatDateFr(item.createdAt)}
        </span>
      )}
    </p>
  );

  const renderEntry = (entry, index, groupKey) => {
    const { item, state, entryKey } = entry;
    const isGap = state === 'gap';
    const isPreview = state === 'preview';

    return (
      <article
        key={entryKey}
        draggable={canReorder && editingItemId !== item.id && state === 'normal'}
        aria-hidden={isGap || undefined}
        onDragStart={(e) => {
          setDrag({ kind: 'item', id: item.id });
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', String(item.id));
        }}
        onDragEnd={resetDrag}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          showPreview(groupKey, index);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (canReorder) handleDrop(groupKey, index);
        }}
        className={`overflow-hidden rounded-md border bg-white p-2.5 ${
          isPreview
            ? 'relative z-20 cursor-grabbing border-primary-500 border-2 border-dashed shadow-lg'
            : isGap
              ? 'border-2 border-dashed border-primary-300 bg-primary-50'
              : 'cursor-grab border-gray-200 active:cursor-grabbing'
        } ${
          overKey === groupKey && drag?.kind === 'item' && drag.id !== item.id && state === 'normal'
            ? 'ring-2 ring-primary-300'
            : ''
        }`}
      >
        <div className={`flex items-start gap-2 ${isGap ? 'invisible' : ''}`}>
          <PositionBadge value={index + 1} muted={isGap} />

          {editingItemId === item.id ? (
            <InlineInput
              value={itemName}
              onChange={setItemName}
              onSubmit={() => commitItemRename(item.id)}
              onCancel={() => setEditingItemId(null)}
              aria-label={`Renommer ${item.name}`}
              className="flex-1"
            />
          ) : (
            <p className="min-w-0 flex-1 break-words text-sm font-semibold text-gray-900">{item.name}</p>
          )}
        </div>

        {editingItemId !== item.id ? itemFooter(item) : null}

        <div
          className={`-mx-2.5 -mb-2.5 mt-3 flex items-center justify-end gap-1 rounded-b-md border-t border-gray-100 bg-gray-50/80 px-2.5 py-1.5 ${
            isGap ? 'invisible' : ''
          }`}
        >
          <Tooltip content="Modifier">
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-primary-600 hover:bg-mint-100"
              onClick={() => {
                setEditingItemId(item.id);
                setItemName(item.name);
              }}
              aria-label={`Modifier ${item.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Supprimer">
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50"
              onClick={() => setConfirm({ kind: 'item', target: item })}
              aria-label={`Supprimer ${item.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      </article>
    );
  };

  const renderGroup = (group) => {
    const groupKey = groupKeyOf(group.id);
    const entries = displayEntries(groupKey);
    const realCount = cardsOf(groupKey).length;
    const filteredOut = Boolean(groupFilter) && groupFilter !== String(group.id);
    const draft = drafts[group.id] || '';
    const tint = tintFor(group.name);

    return (
      <section
        key={group.id}
        aria-label={group.name}
        className={cn('flex flex-col overflow-hidden rounded-lg border border-transparent', tint.band)}
        onDragOver={(e) => {
          e.preventDefault();
          showPreview(groupKey, realCount);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOverKey((k) => (k === groupKey ? null : k));
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (canReorder) handleDrop(groupKey, realCount);
        }}
      >
        <header
          draggable={canReorder && editingGroupId !== group.id}
          onDragStart={(e) => {
            setDrag({ kind: 'group', id: group.id });
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', `group-${group.id}`);
          }}
          onDragEnd={resetDrag}
          className="flex items-center gap-2 border-b border-white/25 px-3 py-2.5"
        >
          {canReorder && <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-white/70" aria-hidden />}

          <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', tint.dot)} aria-hidden />

          {editingGroupId === group.id ? (
            <InlineInput
              value={groupName}
              onChange={setGroupName}
              onSubmit={() => commitGroupRename(group.id)}
              onCancel={() => setEditingGroupId(null)}
              aria-label={`Renommer ${group.name}`}
              className="flex-1"
            />
          ) : (
            <>
              <h3 className="min-w-0 flex-1 truncate text-sm font-bold text-white">{group.name}</h3>
              <span className="shrink-0 rounded-full border border-white/30 bg-white/20 px-2 py-0.5 text-[11px] font-semibold text-white">
                {realCount}
              </span>
              <Tooltip content={`Modifier le ${groupNoun}`}>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    setEditingGroupId(group.id);
                    setGroupName(group.name);
                  }}
                  aria-label={`Modifier ${group.name}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Tooltip>
            </>
          )}

          <Tooltip content={`Supprimer le ${groupNoun}`}>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setConfirm({ kind: 'group', target: group })}
              aria-label={`Supprimer ${group.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </header>

        <div className="flex min-h-16 flex-col gap-2 bg-white/10 p-2">
          {filteredOut ? (
            <p className="px-1 py-2 text-xs text-gray-400">Masqué par le filtre</p>
          ) : entries.length === 0 ? (
            <p className="px-1 py-2 text-xs text-gray-400">Déposez un élément ici</p>
          ) : (
            entries.map((entry, index) => renderEntry(entry, index, groupKey))
          )}
        </div>

        <div className="border-t border-white/25 p-2">
          {addingTo === group.id ? (
            <InlineInput
              value={draft}
              onChange={(v) => setDrafts((prev) => ({ ...prev, [group.id]: v }))}
              onSubmit={() => submitNewItem(group.id)}
              onCancel={() => {
                setDrafts((prev) => ({ ...prev, [group.id]: '' }));
                setAddingTo(null);
              }}
              placeholder={itemPlaceholder}
              ariaLabel={`Ajouter dans ${group.name}`}
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white hover:bg-white/20"
              onClick={() => setAddingTo(group.id)}
            >
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          )}
        </div>
      </section>
    );
  };

  const board = (
    <DataState loading={loading} error={error}>
      <div className="space-y-3 pb-2">
        {groups.map(renderGroup)}

        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-2">          {newGroup == null ? (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600"
              onClick={() => setNewGroup('')}
            >
              <Plus className="h-4 w-4" />
              {`Nouveau ${groupNoun}`}
            </Button>
          ) : (
            <InlineInput
              value={newGroup}
              onChange={setNewGroup}
              onSubmit={submitNewGroup}
              onCancel={() => setNewGroup(null)}
              placeholder={`Nom du ${groupNoun}`}
              ariaLabel={`Nom du ${groupNoun}`}
            />
          )}
        </div>
      </div>
    </DataState>
  );

  return (
    <AdminSectionLayout
      rightContainer={rightContainer}
      total={items.length}
      noun={itemNoun}
      dirty={dirty}
      filters={renderFilters}
      searchId={searchId}
    >
      {board}

      <Modal
        open={Boolean(confirm)}
        onClose={() => !saving && setConfirm(null)}
        dismissable={!saving}
        title={confirm?.kind === 'group' ? `Supprimer ce ${groupNoun} ?` : `Supprimer cet ${itemNoun} ?`}
        description={
          confirm?.kind === 'group'
            ? `Cette action est définitive. Un ${groupNoun} contenant des ${itemNoun}s ne peut pas être supprimé.`
            : `Cette action est définitive. Un ${itemNoun} utilisé par des professionnels ne peut pas être supprimé.`
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)} disabled={saving}>
              Annuler
            </Button>
            <Button variant="danger" onClick={doDelete} loading={saving}>
              Supprimer
            </Button>
          </>
        }
      />
    </AdminSectionLayout>
  );
}
