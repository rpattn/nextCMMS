"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Page, SearchCriteria } from '@/lib/page';
import AssetsGrid, { AssetRow } from '@/components/assets/AssetsGrid';
import SearchBox from '@/components/common/SearchBox';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EntityToolbar from '@/components/entity/EntityToolbar';
import EntityFiltersDrawer from '@/components/entity/EntityFiltersDrawer';
import AssetsFilters from '@/components/assets/AssetsFilters';
import HierarchicalGrid from '@/components/entity/HierarchicalGrid';
import useDetailsDrawer from '@/components/entity/useDetailsDrawer';
import EntityDetailsDrawer from '@/components/entity/EntityDetailsDrawer';
import { useI18n } from '@/components/providers/I18nProvider';
import { Box, Button, Chip, Divider, Stack } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import { useRouter } from 'next/navigation';
import CreateAssetModal from '@/components/assets/CreateAssetModal';
import EditAssetModal from '@/components/assets/EditAssetModal';

export default function AssetsClientPage({
  initialPage = 0,
  initialSize = 10,
  initialQ = '',
  initialSort
}: {
  initialPage?: number;
  initialSize?: number;
  initialQ?: string;
  initialSort?: string | null;
}) {
  const { t } = useI18n();
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialSize);
  const [q, setQ] = useState<string>(initialQ || '');
  const [sortModel, setSortModel] = useState<GridSortModel>(() => {
    if (!initialSort) return [];
    const [field, dir] = initialSort.split(',');
    return field ? [{ field, sort: (dir as 'asc' | 'desc') || 'asc' }] : [];
  });
  const [rows, setRows] = useState<AssetRow[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tab, setTab] = useState<'hierarchy' | 'list'>('list');
  const details = useDetailsDrawer('asset');
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  // Filters state
  const [hideArchived, setHideArchived] = useState(true);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [area, setArea] = useState<string | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [primaryUsers, setPrimaryUsers] = useState<any[]>([]);
  const [assigned_to, setAssignedTo] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [createdFrom, setCreatedFrom] = useState<string | null>(null);
  const [createdTo, setCreatedTo] = useState<string | null>(null);
  const [updatedFrom, setUpdatedFrom] = useState<string | null>(null);
  const [updatedTo, setUpdatedTo] = useState<string | null>(null);
  // Hierarchy pagination
  const [hierPage, setHierPage] = useState<number>(0);
  const [hierPageSize, setHierPageSize] = useState<number>(10);

  // If searching, switch to list view (hierarchy doesn't support server-side search)
  useEffect(() => {
    if (tab === 'hierarchy' && q && q.trim()) {
      setTab('list');
    }
  }, [q, tab]);


  const criteria: SearchCriteria = useMemo(() => {
    const filterFields = [] as SearchCriteria['filterFields'];
    const ALLOWED_ASSET_STATUSES = new Set([
      'OPERATIONAL',
      'MODERNIZATION',
      'DOWN',
      'STANDBY',
      'INSPECTION_SCHEDULED',
      'COMMISSIONING',
      'EMERGENCY_SHUTDOWN'
    ]);
    const qTrim = q?.trim();
    if (qTrim) filterFields.push({ field: 'name', value: qTrim, operation: 'cn', alternatives: [{ field: 'description', operation: 'cn', value: qTrim }] } as any);
    if (hideArchived) filterFields.push({ field: 'archived', operation: 'eq', value: false } as any);
    const statusVals = statuses.filter((s) => ALLOWED_ASSET_STATUSES.has(s));
    if (statusVals.length) filterFields.push({ field: 'status', operation: 'in', value: '', values: statusVals, enumName: 'STATUS' } as any);
    if (locations.length) filterFields.push({ field: 'location', operation: 'in', value: '', values: locations.map((o: any) => o.id) } as any);
    if (area) filterFields.push({ field: 'area', operation: 'cn', value: area } as any);
    if (model) filterFields.push({ field: 'model', operation: 'cn', value: model } as any);
    if (teams.length) filterFields.push({ field: 'team', operation: 'in', value: '', values: teams.map((o: any) => o.id) } as any);
    if (primaryUsers.length) filterFields.push({ field: 'primaryUser', operation: 'in', value: '', values: primaryUsers.map((o: any) => o.id) } as any);
    if (assigned_to.length) filterFields.push({ field: 'assigned_to', operation: 'inm', value: '', values: assigned_to.map((o: any) => o.id) } as any);
    if (customers.length) filterFields.push({ field: 'customer', operation: 'inm', value: '', values: customers.map((o: any) => o.id) } as any);
    if (vendors.length) filterFields.push({ field: 'vendor', operation: 'inm', value: '', values: vendors.map((o: any) => o.id) } as any);
    if (createdFrom) filterFields.push({ field: 'created_at', operation: 'ge', value: createdFrom } as any);
    if (createdTo) filterFields.push({ field: 'created_at', operation: 'le', value: createdTo } as any);
    if (updatedFrom) filterFields.push({ field: 'updated_at', operation: 'ge', value: updatedFrom } as any);
    if (updatedTo) filterFields.push({ field: 'updated_at', operation: 'le', value: updatedTo } as any);
    const crit: SearchCriteria = { pageNum: page, pageSize, filterFields };
    if (sortModel.length) crit.sortField = sortModel[0].field, crit.direction = (sortModel[0].sort === 'desc' ? 'DESC' : 'ASC');
    return crit;
  }, [page, pageSize, q, sortModel, hideArchived, statuses, locations, area, model, teams, primaryUsers, assigned_to, customers, vendors, createdFrom, createdTo, updatedFrom, updatedTo]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<Page<AssetRow>>('assets/search', { method: 'POST', body: JSON.stringify(criteria) });
      setRows((res as any).content || []);
      setRowCount((res as any).totalElements || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [criteria, refreshKey]);

  useEffect(() => { load(); }, [load]);

  const onChangePagination = (model: GridPaginationModel) => { setPage(model.page); setPageSize(model.pageSize); };
  const onChangeSort = (model: GridSortModel) => { setSortModel(model); };

  return (
    <main>
      <EntityToolbar
        tabs={{
          value: tab,
          onChange: (v) => setTab(v as 'hierarchy' | 'list'),
          items: [
            { value: 'list', label: t('list_view') || 'List' },
            { value: 'hierarchy', label: t('hierarchy_view') || 'Hierarchy' }
          ]
        }}
        onOpenFilters={() => setFiltersOpen(true)}
        filterTooltip={t('filters') || 'Filters'}
        menuItems={[{
          key: 'export', label: t('export') || 'Export', onClick: async () => {
            try { const res = await api<{ success: boolean; message: string }>('export/assets'); if (res?.message) window.open(res.message, '_blank'); }
            catch { alert('Export failed'); }
          }
        }]}
        primaryButton={{ label: t('add_asset') || 'Add Asset', onClick: () => setCreateOpen(true), startIcon: <AddTwoToneIcon /> }}
      />
      <SearchBox initial={initialQ} value={q} onSearch={(val) => { setPage(0); setQ(val); }} />

      <EntityFiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('filters') || 'Filters'}>
        <AssetsFilters
          hideArchived={hideArchived}
          onHideArchivedChange={(v) => { setPage(0); setHideArchived(v); }}
          statuses={statuses}
          onStatusesChange={(vals) => { setPage(0); setStatuses(vals); }}
          locations={locations}
          onLocationsChange={(vals) => { setPage(0); setLocations(vals); }}
          area={area}
          onAreaChange={(v) => { setPage(0); setArea(v); }}
          model={model}
          onModelChange={(v) => { setPage(0); setModel(v); }}
          teams={teams}
          onTeamsChange={(vals) => { setPage(0); setTeams(vals); }}
          primaryUsers={primaryUsers}
          onPrimaryUsersChange={(vals) => { setPage(0); setPrimaryUsers(vals); }}
          assigned_to={assigned_to}
          onAssignedToChange={(vals) => { setPage(0); setAssignedTo(vals); }}
          customers={customers}
          onCustomersChange={(vals) => { setPage(0); setCustomers(vals); }}
          vendors={vendors}
          onVendorsChange={(vals) => { setPage(0); setVendors(vals); }}
          createdFrom={createdFrom}
          createdTo={createdTo}
          onCreatedFromChange={(v) => { setPage(0); setCreatedFrom(v); }}
          onCreatedToChange={(v) => { setPage(0); setCreatedTo(v); }}
          updatedFrom={updatedFrom}
          updatedTo={updatedTo}
          onUpdatedFromChange={(v) => { setPage(0); setUpdatedFrom(v); }}
          onUpdatedToChange={(v) => { setPage(0); setUpdatedTo(v); }}
        />
      </EntityFiltersDrawer>

      {error && (<div style={{ color: 'red', marginBottom: 8 }}>{error}</div>)}
      {tab === 'list' && (
        <div style={{ opacity: loading ? 0.7 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
          <AssetsGrid
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
      )}
      {tab === 'hierarchy' && (
        <HierarchicalGrid
          key={`assets-hier-${refreshKey}`}
          columns={[
            { field: 'id', headerName: 'ID', width: 120 },
            { field: 'name', headerName: 'Name', flex: 1, minWidth: 220 },
            {
              field: 'status', headerName: 'Status', width: 140,
              renderCell: (params: any) => {
                const v = (params.value as string) || 'UNKNOWN';
                const color = v === 'OPERATIONAL' ? 'success' : v === 'DOWN' ? 'error' : v === 'DISPOSED' ? 'warning' : 'default';
                return <Chip size="small" label={v} color={color as any} sx={{ verticalAlign: 'inherit' }} />;
              }
            },
            { field: 'location', headerName: 'Location', width: 220, valueGetter: (p: any) => p?.row?.location?.name || '' },
            { field: 'updated_at', headerName: 'Updated', width: 170, valueGetter: (p: any) => p?.row?.updated_at ? new Date(p.row.updated_at).toLocaleString() : '' }
          ] as any}
          primaryField="name"
          fetchChildren={async (parentId) => {
            const res = await api<any[]>(`assets/children/${parentId}`);
            return res.map((a: any) => ({ ...a, hasChildren: !!a.hasChildren }));
          }}
          onRowClick={(id) => details.openById(Number(id))}
          storageKey="assetsHierarchyExpanded"
          childCountAccessor={(row) => (row as any).childrenCount}
          paginationModel={{ page: hierPage, pageSize: hierPageSize }}
          onPaginationModelChange={(model) => { setHierPage(model.page); setHierPageSize(model.pageSize); }}
        />
      )}

      <EntityDetailsDrawer open={details.open} onClose={details.close}>
        {details.id != null && (
          <AssetDetailsPanel
            id={Number(details.id)}
            onClose={details.close}
            onChanged={() => setRefreshKey((k) => k + 1)}
            refreshKey={refreshKey}
            onEdit={(id) => { setEditId(id); setEditOpen(true); }}
          />
        )}
      </EntityDetailsDrawer>

      <CreateAssetModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); setPage(0); setRefreshKey((k) => k + 1); }}
      />

      {editId != null && (
        <EditAssetModal id={editId} open={editOpen} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); setPage(0); setRefreshKey((k) => k + 1); }} />
      )}
    </main>
  );
}

function AssetDetailsPanel({ id, onClose, onChanged, onEdit, refreshKey }: { id: number; onClose: () => void; onChanged?: () => void; onEdit?: (id: number) => void; refreshKey?: number }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    setLoading(true);
    api<any>(`assets/${id}`).then((d) => { if (active) { setData(d); setLoading(false); } }).catch((e: any) => { if (active) { setError(e?.message || 'Failed to load'); setLoading(false); } });
    return () => { active = false; };
  }, [id, refreshKey]);
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>;
  return (
    <div style={{ padding: 16 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Asset #{data?.id}</h3>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<EditTwoToneIcon />} onClick={() => onEdit?.(id)}>
            Edit
          </Button>
          <Button size="small" startIcon={<OpenInNewTwoToneIcon />} onClick={() => router.push(`/app/assets/${id}`)}>
            Open
          </Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={1}>
        <div><b>Name:</b> {data?.name || ''}</div>
        <div><b>Status:</b> <Chip size="small" label={data?.status || 'UNKNOWN'} /></div>
        <div><b>Archived:</b> {data?.archived ? 'Yes' : 'No'}</div>
        <div><b>Has Children:</b> {data?.hasChildren ? 'Yes' : 'No'}</div>
        <div><b>Custom ID:</b> {data?.custom_id || ''}</div>
        <div><b>Model:</b> {data?.model || ''}</div>
        <div><b>Serial Number:</b> {data?.serialNumber || ''}</div>
        <div><b>Barcode:</b> {data?.barCode || ''}</div>
        <div><b>Manufacturer:</b> {data?.manufacturer || ''}</div>
        <div><b>Power:</b> {data?.power || ''}</div>
        <div><b>Acquisition Cost:</b> {data?.acquisitionCost != null ? data.acquisitionCost : ''}</div>
        <div><b>Area:</b> {data?.area || ''}</div>
        <div><b>Location:</b> {data?.location?.name || ''}{data?.location?.custom_id ? ` (${data.location.custom_id})` : ''}</div>
        {data?.parentAsset && (<div><b>Parent Asset:</b> {data.parentAsset.name || `#${data.parentAsset.id}`}</div>)}
        <div><b>Primary User:</b> {data?.primaryUser?.name || [data?.primaryUser?.firstName, data?.primaryUser?.lastName].filter(Boolean).join(' ') || ''}</div>
        {Array.isArray(data?.teams) && data.teams.length > 0 && (
          <div><b>Teams:</b> {data.teams.map((t: any) => t.name || `#${t.id}`).join(', ')}</div>
        )}
        {Array.isArray(data?.assigned_to) && data.assigned_to.length > 0 && (
          <div><b>Additional Workers:</b> {data.assigned_to.map((u: any) => u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || `#${u.id}`).join(', ')}</div>
        )}
        {Array.isArray(data?.customers) && data.customers.length > 0 && (
          <div><b>Customers:</b> {data.customers.map((c: any) => c.name || `#${c.id}`).join(', ')}</div>
        )}
        {Array.isArray(data?.vendors) && data.vendors.length > 0 && (
          <div><b>Vendors:</b> {data.vendors.map((v: any) => v.name || `#${v.id}`).join(', ')}</div>
        )}
        <div><b>In Service Date:</b> {data?.inServiceDate ? new Date(data.inServiceDate).toLocaleDateString() : ''}</div>
        <div><b>Warranty Expiration:</b> {data?.warrantyExpirationDate ? new Date(data.warrantyExpirationDate).toLocaleDateString() : ''}</div>
        {data?.additionalInfos && (
          <div><b>Additional Infos:</b><br />{data.additionalInfos}</div>
        )}
        <div><b>Description:</b><br />{data?.description || ''}</div>
        {Array.isArray(data?.files) && data.files.length > 0 && (
          <div><b>Files:</b> {data.files.length}</div>
        )}
        {Array.isArray(data?.parts) && data.parts.length > 0 && (
          <div><b>Parts:</b> {data.parts.length}</div>
        )}
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          <b>Created:</b> {data?.created_at ? new Date(data.created_at).toLocaleString() : ''} · <b>Updated:</b> {data?.updated_at ? new Date(data.updated_at).toLocaleString() : ''}
        </div>
      </Stack>
    </div>
  );
}
