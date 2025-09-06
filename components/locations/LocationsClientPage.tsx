"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Page, SearchCriteria } from '@/lib/page';
import LocationsGrid, { LocationRow } from '@/components/locations/LocationsGrid';
import SearchBox from '@/components/common/SearchBox';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EntityToolbar from '@/components/entity/EntityToolbar';
import EntityFiltersDrawer from '@/components/entity/EntityFiltersDrawer';
import LocationsFilters from '@/components/locations/LocationsFilters';
import useDetailsDrawer from '@/components/entity/useDetailsDrawer';
import EntityDetailsDrawer from '@/components/entity/EntityDetailsDrawer';
import { useI18n } from '@/components/providers/I18nProvider';
import { Box, Button, Divider, Stack, CircularProgress } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import { useRouter } from 'next/navigation';
import CreateLocationModal from '@/components/locations/CreateLocationModal';
import EditLocationModal from '@/components/locations/EditLocationModal';
import BasicMap from '@/components/common/BasicMap';
import HierarchicalGrid from '@/components/entity/HierarchicalGrid';

export default function LocationsClientPage({
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
  const [tab, setTab] = useState<'list' | 'map' | 'hierarchy'>('list');
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialSize);
  const [q, setQ] = useState<string>(initialQ || '');
  const [sortModel, setSortModel] = useState<GridSortModel>(() => {
    if (!initialSort) return [];
    const [field, dir] = initialSort.split(',');
    return field ? [{ field, sort: (dir as 'asc' | 'desc') || 'asc' }] : [];
  });
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [rowCount, setRowCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const details = useDetailsDrawer('loc');
  const [refreshKey, setRefreshKey] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  // Filters state
  const [parentLocation, setParentLocation] = useState<any | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [custom_id, setCustomId] = useState<string | null>(null);
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [createdFrom, setCreatedFrom] = useState<string | null>(null);
  const [createdTo, setCreatedTo] = useState<string | null>(null);
  const [updatedFrom, setUpdatedFrom] = useState<string | null>(null);
  const [updatedTo, setUpdatedTo] = useState<string | null>(null);
  const [mapPoints, setMapPoints] = useState<Array<{ id: number; title: string; address?: string; coordinates: { lat: number; lng: number } }>>([]);
  const [mapFetching, setMapFetching] = useState(false);

  const criteria: SearchCriteria = useMemo(() => {
    const filterFields = [] as SearchCriteria['filterFields'];
    const qTrim = q?.trim();
    if (qTrim) filterFields.push({ field: 'name', value: qTrim, operation: 'cn', alternatives: [ { field: 'address', operation: 'cn', value: qTrim } ] } as any);
    // default hide archived locations if backend supports it; otherwise omit
    // filterFields.push({ field: 'archived', operation: 'eq', value: false } as any);
    if (parentLocation?.id) filterFields.push({ field: 'parentLocation', operation: 'in', value: '', values: [parentLocation.id] } as any);
    if (address) filterFields.push({ field: 'address', operation: 'cn', value: address } as any);
    if (custom_id) filterFields.push({ field: 'custom_id', operation: 'cn', value: custom_id } as any);
    if (hasChildren != null) filterFields.push({ field: 'hasChildren', operation: 'eq', value: !!hasChildren } as any);
    if (teams.length) filterFields.push({ field: 'team', operation: 'in', value: '', values: teams.map((o: any) => o.id) } as any);
    if (vendors.length) filterFields.push({ field: 'vendor', operation: 'inm', value: '', values: vendors.map((o: any) => o.id) } as any);
    if (customers.length) filterFields.push({ field: 'customer', operation: 'inm', value: '', values: customers.map((o: any) => o.id) } as any);
    if (workers.length) filterFields.push({ field: 'workers', operation: 'inm', value: '', values: workers.map((o: any) => o.id) } as any);
    if (createdFrom) filterFields.push({ field: 'created_at', operation: 'ge', value: createdFrom } as any);
    if (createdTo) filterFields.push({ field: 'created_at', operation: 'le', value: createdTo } as any);
    if (updatedFrom) filterFields.push({ field: 'updated_at', operation: 'ge', value: updatedFrom } as any);
    if (updatedTo) filterFields.push({ field: 'updated_at', operation: 'le', value: updatedTo } as any);
    const crit: SearchCriteria = { pageNum: page, pageSize, filterFields };
    if (sortModel.length) crit.sortField = sortModel[0].field, crit.direction = (sortModel[0].sort === 'desc' ? 'DESC' : 'ASC');
    return crit;
  }, [page, pageSize, q, sortModel, parentLocation, address, custom_id, hasChildren, teams, vendors, customers, workers, createdFrom, createdTo, updatedFrom, updatedTo]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api<Page<LocationRow>>('locations/search', { method: 'POST', body: JSON.stringify(criteria) });
      setRows((res as any).content || []);
      setRowCount((res as any).totalElements || 0);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [criteria, refreshKey]);

  useEffect(() => { load(); }, [load]);

  // Fetch all matching locations (across all pages) for the Map tab
  useEffect(() => {
    let active = true;
    async function fetchAll() {
      if (tab !== 'map') return;
      setMapFetching(true);
      try {
        const pageSize = 500;
        let pageNum = 0;
        let all: any[] = [];
        // Use existing filters, but iterate over pages
        while (true) {
          const payload = { ...criteria, pageNum, pageSize } as any;
          const res = await api<Page<any>>('locations/search', { method: 'POST', body: JSON.stringify(payload) });
          const content = (res as any)?.content || [];
          all = all.concat(content);
          if (res.last || content.length === 0) break;
          pageNum += 1;
          // safety cap
          if (pageNum > 50) break;
        }
        if (!active) return;
        const pts = all
          .filter((r: any) => r?.latitude != null && r?.longitude != null)
          .map((r: any) => ({ id: r.id, title: r.name || `#${r.id}`, address: r.address || '', coordinates: { lat: Number(r.latitude), lng: Number(r.longitude) } }));
        setMapPoints(pts);
      } catch (e) {
        if (!active) return;
        setMapPoints([]);
      } finally {
        if (active) setMapFetching(false);
      }
    }
    fetchAll();
    return () => { active = false; };
    // include all criteria deps used to filter
  }, [tab, criteria, refreshKey]);

  const onChangePagination = (model: GridPaginationModel) => { setPage(model.page); setPageSize(model.pageSize); };
  const onChangeSort = (model: GridSortModel) => { setSortModel(model); };

  return (
    <main>
      <EntityToolbar
        tabs={{
          value: tab,
          onChange: (v) => setTab(v as 'list' | 'map'),
          items: [
            { value: 'list', label: t('list_view') || 'List' },
            { value: 'hierarchy', label: t('hierarchy_view') || 'Hierarchy' },
            { value: 'map', label: t('map_view') || 'Map' }
          ]
        }}
        onOpenFilters={() => setFiltersOpen(true)}
        filterTooltip={t('filters') || 'Filters'}
        menuItems={[{ key: 'export', label: t('export') || 'Export', onClick: async () => {
          try { const res = await api<{ success: boolean; message: string }>('export/locations'); if (res?.message) window.open(res.message, '_blank'); }
          catch { alert('Export failed'); }
        }}]}
        primaryButton={{ label: t('add_location') || 'Add Location', onClick: () => setCreateOpen(true), startIcon: <AddTwoToneIcon /> }}
      />
      <SearchBox initial={initialQ} value={q} onSearch={(val) => { setPage(0); setQ(val); }} />

      <EntityFiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title={t('filters') || 'Filters'}>
        <LocationsFilters
          parentLocation={parentLocation}
          onParentLocationChange={(v) => { setPage(0); setParentLocation(v); }}
          address={address}
          onAddressChange={(v) => { setPage(0); setAddress(v); }}
          custom_id={custom_id}
          onCustomIdChange={(v) => { setPage(0); setCustomId(v); }}
          hasChildren={hasChildren}
          onHasChildrenChange={(v) => { setPage(0); setHasChildren(v); }}
          teams={teams}
          onTeamsChange={(vals) => { setPage(0); setTeams(vals); }}
          vendors={vendors}
          onVendorsChange={(vals) => { setPage(0); setVendors(vals); }}
          customers={customers}
          onCustomersChange={(vals) => { setPage(0); setCustomers(vals); }}
          workers={workers}
          onWorkersChange={(vals) => { setPage(0); setWorkers(vals); }}
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
          <LocationsGrid
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
      {tab === 'map' && (
        <div>
          {mapFetching ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360, gap: 1.5 }} aria-busy>
              <CircularProgress size={18} />
              <span style={{ color: 'var(--mui-palette-text-secondary)' }}>{t('loading') || 'Loading locations…'}</span>
            </Box>
          ) : (
            <BasicMap locations={mapPoints} />
          )}
        </div>
      )}
      {tab === 'hierarchy' && (
        <HierarchicalGrid
          key={`locations-hier-${refreshKey}`}
          columns={[
            { field: 'id', headerName: 'ID', width: 120 },
            { field: 'name', headerName: 'Name', flex: 1, minWidth: 220 },
            { field: 'address', headerName: 'Address', flex: 1, minWidth: 220 },
            { field: 'updated_at', headerName: 'Updated', width: 170, valueGetter: (p: any) => p?.row?.updated_at ? new Date(p.row.updated_at).toLocaleString() : '' }
          ] as any}
          primaryField="name"
          fetchChildren={async (parentId) => {
            const res = await api<any[]>(`locations/children/${parentId}`);
            return res.map((l: any) => ({ ...l, hasChildren: !!l.hasChildren }));
          }}
          onRowClick={(id) => details.openById(Number(id))}
          storageKey="locationsHierarchyExpanded"
          childCountAccessor={(row) => (row as any).childrenCount}
        />
      )}

      <EntityDetailsDrawer open={details.open} onClose={details.close}>
        {details.id != null && (
          <LocationDetailsPanel
            id={Number(details.id)}
            onClose={details.close}
            onChanged={() => setRefreshKey((k) => k + 1)}
            refreshKey={refreshKey}
            onEdit={(id) => { setEditId(id); setEditOpen(true); }}
          />
        )}
      </EntityDetailsDrawer>

      <CreateLocationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); setPage(0); setRefreshKey((k) => k + 1); }}
      />

      {editId != null && (
        <EditLocationModal id={editId} open={editOpen} onClose={() => setEditOpen(false)} onSaved={() => { setEditOpen(false); setPage(0); setRefreshKey((k) => k + 1); }} />
      )}
    </main>
  );
}

function LocationDetailsPanel({ id, onClose, onChanged, onEdit, refreshKey }: { id: number; onClose: () => void; onChanged?: () => void; onEdit?: (id: number) => void; refreshKey?: number }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    setLoading(true);
    api<any>(`locations/${id}`).then((d) => { if (active) { setData(d); setLoading(false); } }).catch((e: any) => { if (active) { setError(e?.message || 'Failed to load'); setLoading(false); } });
    return () => { active = false; };
  }, [id, refreshKey]);
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16, color: 'red' }}>{error}</div>;
  return (
    <div style={{ padding: 16 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>Location #{data?.id}</h3>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<EditTwoToneIcon />} onClick={() => onEdit?.(id)}>
            Edit
          </Button>
          <Button size="small" startIcon={<OpenInNewTwoToneIcon />} onClick={() => router.push(`/app/locations/${id}`)}>
            Open
          </Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 1 }} />
      <Stack spacing={1}>
        <div><b>Name:</b> {data?.name || ''}</div>
        <div><b>Address:</b> {data?.address || ''}</div>
        <div><b>Parent Location:</b> {data?.parentLocation?.name || ''}</div>
        <div><b>Custom ID:</b> {data?.custom_id || ''}</div>
        <div><b>Coordinates:</b> {data?.latitude != null || data?.longitude != null ? `${data?.latitude ?? ''}, ${data?.longitude ?? ''}` : ''}</div>
        <div><b>Has Children:</b> {data?.hasChildren ? 'Yes' : 'No'}</div>
        {Array.isArray(data?.teams) && data.teams.length > 0 && (
          <div><b>Teams:</b> {data.teams.map((t: any) => t.name || `#${t.id}`).join(', ')}</div>
        )}
        {Array.isArray(data?.workers) && data.workers.length > 0 && (
          <div><b>Workers:</b> {data.workers.map((u: any) => u.name || [u.firstName, u.lastName].filter(Boolean).join(' ') || `#${u.id}`).join(', ')}</div>
        )}
        {Array.isArray(data?.customers) && data.customers.length > 0 && (
          <div><b>Customers:</b> {data.customers.map((c: any) => c.name || `#${c.id}`).join(', ')}</div>
        )}
        {Array.isArray(data?.vendors) && data.vendors.length > 0 && (
          <div><b>Vendors:</b> {data.vendors.map((v: any) => v.name || `#${v.id}`).join(', ')}</div>
        )}
        {Array.isArray(data?.files) && data.files.length > 0 && (
          <div><b>Files:</b> {data.files.length}</div>
        )}
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          <b>Created:</b> {data?.created_at ? new Date(data.created_at).toLocaleString() : ''} · <b>Updated:</b> {data?.updated_at ? new Date(data.updated_at).toLocaleString() : ''}
        </div>
      </Stack>
    </div>
  );
}
