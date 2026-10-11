import { useCallback, useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button, CustomSelect, DataState, Modal } from '@/shared/components/ui';
import {
  AdminFilterGroup,
  AdminFilterPanel,
  AdminSectionLayout,
} from './AdminSectionLayout.jsx';
import { useNotification } from '@/shared/context/NotificationContext.jsx';
import { groupKeyOf, groupItems, tintFor, displayEntries as buildEntries, destinationIndex as entryDestination } from './catalog/catalogUtils.js';
import { CatalogGroupColumn } from './catalog/CatalogGroupColumn.jsx';
import { CatalogItemCard } from './catalog/CatalogItemCard.jsx';
import { InlineInput } from './catalog/InlineInput.jsx';

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

const itemHandlers = {
    startDrag: (id) => setDrag({ kind: 'item', id }),
    resetDrag,
    showPreview,
    handleDrop,
    setItemName,
    commitItemRename,
    stopEditingItem: () => setEditingItemId(null),
    startEditingItem: (item) => {
      setEditingItemId(item.id);
      setItemName(item.name);
    },
    requestDelete: (kind, target) => setConfirm({ kind, target }),
  };

  const groupHandlers = {
    ...itemHandlers,
    startGroupDrag: (id) => setDrag({ kind: 'group', id }),
    setOverKey,
    setGroupName,
    commitGroupRename,
    stopEditingGroup: () => setEditingGroupId(null),
    startEditingGroup: (group) => {
      setEditingGroupId(group.id);
      setGroupName(group.name);
    },
    setDraft: (groupId, value) => setDrafts((prev) => ({ ...prev, [groupId]: value })),
    submitNewItem,
    cancelNewItem: (groupId) => {
      setDrafts((prev) => ({ ...prev, [groupId]: '' }));
      setAddingTo(null);
    },
    startAdding: (groupId) => setAddingTo(groupId),
    renderEntry: (entry, index, groupKey) => (
      <CatalogItemCard
        key={entry.entryKey}
        entry={entry}
        index={index}
        groupKey={groupKey}
        canReorder={canReorder}
        editingItemId={editingItemId}
        itemName={itemName}
        drag={drag}
        overKey={overKey}
        handlers={itemHandlers}
      />
    ),
  };

  const board = (
    <DataState loading={loading} error={error}>
      <div className="space-y-3 pb-2">
        {groups.map((group) => (
          <CatalogGroupColumn
            key={group.id}
            group={group}
            groupKey={groupKeyOf(group.id)}
            entries={displayEntries(groupKeyOf(group.id))}
            realCount={cardsOf(groupKeyOf(group.id)).length}
            filteredOut={Boolean(groupFilter) && groupFilter !== String(group.id)}
            draft={drafts[group.id] || ''}
            tint={tintFor(group.name)}
            groupNoun={groupNoun}
            itemPlaceholder={itemPlaceholder}
            canReorder={canReorder}
            editingGroupId={editingGroupId}
            groupName={groupName}
            isAdding={addingTo === group.id}
            handlers={groupHandlers}
          />
        ))}

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
