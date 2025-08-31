"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Page, SearchCriteria } from '@/lib/page';
import WorkOrdersGrid, { WorkOrderRow } from '@/components/work-orders/WorkOrdersGrid';
import SearchBox from '@/components/common/SearchBox';
import WorkOrdersFilters from '@/components/work-orders/WorkOrdersFilters';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { useI18n } from '@/components/providers/I18nProvider';
import CreateWorkOrderModal from '@/components/work-orders/CreateWorkOrderModal';
import WorkOrderDetailsPanel from '@/components/work-orders/WorkOrderDetailsPanel';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import EditWorkOrderModal from '@/components/work-orders/EditWorkOrderModal';
import WorkOrdersCalendar from '@/components/work-orders/WorkOrdersCalendar';
import { RemoteOption } from '@/components/common/RemoteSearchSelect';
import useDetailsDrawer from '@/components/entity/useDetailsDrawer';
import EntityDetailsDrawer from '@/components/entity/EntityDetailsDrawer';
import EntityToolbar from '@/components/entity/EntityToolbar';
import EntityFiltersDrawer from '@/components/entity/EntityFiltersDrawer';

export default function WorkOrdersClientPage({
  initialPage = 0,
  initialSize = 10,
  initialQ = '',
  initialSort,
  initialPriority
}: {
  initialPage?: number;
  initialSize?: number;
  initialQ?: string;
  initialSort?: string | null;
  initialPriority?: string | null;
}) {
  const { t } = useI18n();
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialSize);
  const [q, setQ] = useState<string>(initialQ || '');
  const [priority, setPriority] = useState<string>((initialPriority || 'ALL').toUpperCase());
  const [sortModel, setSortModel] = useState<GridSortModel>(() => {
    if (!initialSort) return [];
    const [field, dir] = initialSort.split(',');
    return field ? [{ field, sort: (dir as 'asc' | 'desc') || 'asc' }] : [];
  });
  const [rows, setRows] = useState<WorkOrderRow[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<'list' | 'calendar'>('list');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statuses, setStatuses] = useState<string[]>(['OPEN', 'IN_PROGRESS', 'ON_HOLD']);
  const [hideArchived, setHideArchived] = useState<boolean>(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialDueDate, setCreateInitialDueDate] = useState<Date | null>(null);
  const details = useDetailsDrawer('wo');
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [editId, setEditId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [dueFrom, setDueFrom] = useState<string | null>(null);
  const [dueTo, setDueTo] = useState<string | null>(null);
  // Advanced filters state
  const [typeValue, setTypeValue] = useState<'ALL' | 'REACTIVE' | 'REPEATING'>('ALL');
  const [assets, setAssets] = useState<RemoteOption[]>([]);
  const [locations, setLocations] = useState<RemoteOption[]>([]);
  const [teams, setTeams] = useState<RemoteOption[]>([]);
  const [primaryUsers, setPrimaryUsers] = useState<RemoteOption[]>([]);
  const [assignedToUsers, setAssignedToUsers] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);
  const [createdByUsers, setCreatedByUsers] = useState<RemoteOption[]>([]);
  const [completedByUsers, setCompletedByUsers] = useState<RemoteOption[]>([]);
  const [createdFrom, setCreatedFrom] = useState<string | null>(null);
  const [createdTo, setCreatedTo] = useState<string | null>(null);
  const [updatedFrom, setUpdatedFrom] = useState<string | null>(null);
  const [updatedTo, setUpdatedTo] = useState<string | null>(null);
  const [completedFrom, setCompletedFrom] = useState<string | null>(null);
  const [completedTo, setCompletedTo] = useState<string | null>(null);

  // Details drawer is now controlled by URL param via hook

  const criteria: SearchCriteria = useMemo(() => {
    const filterFields = [] as SearchCriteria['filterFields'];
    const allowedPriorities = ['HIGH', 'MEDIUM', 'LOW', 'NONE'];
    const qTrim = q?.trim();
    if (qTrim) filterFields.push({ field: 'title', value: qTrim, operation: 'cn' });
    if (priority && allowedPriorities.includes(priority)) {
      filterFields.push({
        field: 'priority',
        operation: 'in',
        value: '',
        values: [priority],
        enumName: 'PRIORITY'
      });
    }
    if (statuses && statuses.length) {
      filterFields.push({ field: 'status', operation: 'in', value: '', values: statuses, enumName: 'STATUS' } as any);
    }
    if (hideArchived) {
      filterFields.push({ field: 'archived', operation: 'eq', value: false } as any);
    }
    if (dueFrom) {
      filterFields.push({ field: 'dueDate', operation: 'ge', value: dueFrom } as any);
    }
    if (dueTo) {
      filterFields.push({ field: 'dueDate', operation: 'le', value: dueTo } as any);
    }
    if (typeValue === 'REACTIVE') filterFields.push({ field: 'parentPreventiveMaintenance', operation: 'nu', value: '' } as any);
    if (typeValue === 'REPEATING') filterFields.push({ field: 'parentPreventiveMaintenance', operation: 'nn', value: '' } as any);
    if (assets.length) filterFields.push({ field: 'asset', operation: 'in', value: '', values: assets.map(a => a.id) } as any);
    if (locations.length) filterFields.push({ field: 'location', operation: 'in', value: '', values: locations.map(a => a.id) } as any);
    if (teams.length) filterFields.push({ field: 'team', operation: 'in', value: '', values: teams.map(a => a.id) } as any);
    if (primaryUsers.length) filterFields.push({ field: 'primaryUser', operation: 'in', value: '', values: primaryUsers.map(a => a.id) } as any);
    if (createdByUsers.length) filterFields.push({ field: 'createdBy', operation: 'in', value: '', values: createdByUsers.map(a => a.id) } as any);
    if (completedByUsers.length) filterFields.push({ field: 'completedBy', operation: 'in', value: '', values: completedByUsers.map(a => a.id) } as any);
    if (assignedToUsers.length) filterFields.push({ field: 'assignedTo', operation: 'inm', value: '', values: assignedToUsers.map(a => a.id) } as any);
    if (customers.length) filterFields.push({ field: 'customer', operation: 'inm', value: '', values: customers.map(a => a.id) } as any);
    if (createdFrom) filterFields.push({ field: 'createdAt', operation: 'ge', value: createdFrom } as any);
    if (createdTo) filterFields.push({ field: 'createdAt', operation: 'le', value: createdTo } as any);
    if (updatedFrom) filterFields.push({ field: 'updatedAt', operation: 'ge', value: updatedFrom } as any);
    if (updatedTo) filterFields.push({ field: 'updatedAt', operation: 'le', value: updatedTo } as any);
    if (completedFrom) filterFields.push({ field: 'completedOn', operation: 'ge', value: completedFrom } as any);
    if (completedTo) filterFields.push({ field: 'completedOn', operation: 'le', value: completedTo } as any);
    const crit: SearchCriteria = {
      pageNum: page,
      pageSize,
      filterFields
    };
    if (sortModel.length) {
      const mapping: Record<string, string> = {
        id: 'id',
        title: 'title',
        priority: 'priority',
        status: 'status',
        dueDate: 'dueDate',
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        completedOn: 'completedOn'
      };
      const field = sortModel[0].field;
      crit.sortField = mapping[field] || field;
      crit.direction = (sortModel[0].sort === 'desc' ? 'DESC' : 'ASC');
    }
    return crit;
  }, [page, pageSize, q, priority, sortModel, statuses, hideArchived, dueFrom, dueTo, typeValue, assets, locations, teams, primaryUsers, createdByUsers, completedByUsers, assignedToUsers, customers, createdFrom, createdTo, updatedFrom, updatedTo, completedFrom, completedTo]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<Page<WorkOrderRow>>('work-orders/search', {
        method: 'POST',
        body: JSON.stringify(criteria)
      });
      setRows(res.content || []);
      setRowCount(res.totalElements || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [criteria, refreshKey]);

  useEffect(() => {
    load();
  }, [load]);

  const onChangePagination = (model: GridPaginationModel) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };
  const onChangeSort = (model: GridSortModel) => {
    setSortModel(model);
  };

  return (
    <main>
      <EntityToolbar
        tabs={{
          value: tab,
          onChange: (v) => setTab(v as 'list' | 'calendar'),
          items: [
            { value: 'list', label: t('list_view') || 'List' },
            { value: 'calendar', label: t('calendar_view') || 'Calendar' }
          ]
        }}
        onOpenFilters={() => setFiltersOpen(true)}
        filterTooltip={t('filters') || 'Filters'}
        menuItems={[{
          key: 'export',
          label: t('export') || 'Export',
          onClick: async () => {
            try {
              const res = await api<{ success: boolean; message: string }>('export/work-orders');
              if (res?.message) window.open(res.message, '_blank');
            } catch (e) {
              console.error(e);
              alert('Export failed');
            }
          }
        }]}
        primaryButton={{ label: t('add_work_order') || 'Add Work Order', onClick: () => setCreateOpen(true), startIcon: <AddTwoToneIcon /> }}
      />
      <SearchBox initial={initialQ} value={q} onSearch={(val) => { setPage(0); setQ(val); }} />
      <EntityFiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('filters') || 'Filters'}>
        <WorkOrdersFilters
          value={priority}
          onPriorityChange={(v) => { setPage(0); setPriority(v.toUpperCase()); }}
          statuses={statuses}
          onStatusesChange={(vals) => { setPage(0); setStatuses(vals); }}
          hideArchived={hideArchived}
          onHideArchivedChange={(val) => { setPage(0); setHideArchived(val); }}
          dueFrom={dueFrom}
          dueTo={dueTo}
          onDueFromChange={(v) => { setPage(0); setDueFrom(v); }}
          onDueToChange={(v) => { setPage(0); setDueTo(v); }}
          typeValue={typeValue}
          onTypeChange={(v) => { setPage(0); setTypeValue(v); }}
          assets={assets}
          onAssetsChange={(vals) => { setPage(0); setAssets(vals); }}
          locations={locations}
          onLocationsChange={(vals) => { setPage(0); setLocations(vals); }}
          teams={teams}
          onTeamsChange={(vals) => { setPage(0); setTeams(vals); }}
          primaryUsers={primaryUsers}
          onPrimaryUsersChange={(vals) => { setPage(0); setPrimaryUsers(vals); }}
          assignedTo={assignedToUsers}
          onAssignedToChange={(vals) => { setPage(0); setAssignedToUsers(vals); }}
          customers={customers}
          onCustomersChange={(vals) => { setPage(0); setCustomers(vals); }}
          createdFrom={createdFrom}
          createdTo={createdTo}
          onCreatedFromChange={(v) => { setPage(0); setCreatedFrom(v); }}
          onCreatedToChange={(v) => { setPage(0); setCreatedTo(v); }}
          updatedFrom={updatedFrom}
          updatedTo={updatedTo}
          onUpdatedFromChange={(v) => { setPage(0); setUpdatedFrom(v); }}
          onUpdatedToChange={(v) => { setPage(0); setUpdatedTo(v); }}
          completedFrom={completedFrom}
          completedTo={completedTo}
          onCompletedFromChange={(v) => { setPage(0); setCompletedFrom(v); }}
          onCompletedToChange={(v) => { setPage(0); setCompletedTo(v); }}
        />
      </EntityFiltersDrawer>
      {tab === 'calendar' && (
        <WorkOrdersCalendar onDateClick={(date) => { setCreateInitialDueDate(date); setCreateOpen(true); }} />
      )}
      {tab === 'list' && (
        <>
          {error && (
            <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>
          )}
          <div
            style={{
              opacity: loading ? 0.7 : 1,
              pointerEvents: loading ? 'none' : 'auto',
            }}
          >
          <WorkOrdersGrid
            rows={rows}
            page={page}
            pageSize={pageSize}
            rowCount={rowCount}
            q={q}
            loading={loading}
            onChangePagination={onChangePagination}
            onChangeSort={onChangeSort}
            onAfterAction={() => setRefreshKey((k) => k + 1)}
            onOpenDetails={(id) => details.openById(id)}
            onEdit={(id) => { setEditId(id); setEditOpen(true); }}
          />
        </div>
        </>
      )}

      <CreateWorkOrderModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          // refresh list
          setCreateOpen(false);
          // call load via toggling deps by changing page to 0
          setPage(0);
        }}
        initialDueDate={createInitialDueDate}
      />

      {editId != null && (
        <EditWorkOrderModal id={editId} open={editOpen} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); setPage(0); }} />
      )}

      <EntityDetailsDrawer open={details.open} onClose={details.close}>
        {details.id != null && (
          <WorkOrderDetailsPanel id={Number(details.id)} onClose={details.close} onChanged={() => setRefreshKey((k) => k + 1)} />
        )}
      </EntityDetailsDrawer>

    </main>
  );
}
