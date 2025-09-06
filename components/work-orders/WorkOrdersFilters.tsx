"use client";

import { MenuItem, Select, InputLabel, FormControl, Stack, FormControlLabel, Checkbox, TextField, Divider } from '@mui/material';
import { useI18n } from '@/components/providers/I18nProvider';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';
import { api } from '@/lib/api';

const priorities = ['ALL', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] as const;

export default function WorkOrdersFilters({
  value,
  onPriorityChange,
  statuses = ['OPEN','IN_PROGRESS','ON_HOLD'],
  onStatusesChange,
  hideArchived = true,
  onHideArchivedChange,
  dueFrom,
  dueTo,
  onDueFromChange,
  onDueToChange,
  // Advanced filters
  typeValue = 'ALL',
  onTypeChange,
  assets = [],
  onAssetsChange,
  categories = [],
  onCategoriesChange,
  teams = [],
  onTeamsChange,
  primaryUsers = [],
  onPrimaryUsersChange,
  locations = [],
  onLocationsChange,
  createdBy = [],
  onCreatedByChange,
  completedBy = [],
  onCompletedByChange,
  assigned_to = [],
  onAssignedToChange,
  customers = [],
  onCustomersChange,
  createdFrom,
  createdTo,
  onCreatedFromChange,
  onCreatedToChange,
  updatedFrom,
  updatedTo,
  onUpdatedFromChange,
  onUpdatedToChange,
  completedFrom,
  completedTo,
  onCompletedFromChange,
  onCompletedToChange
}: {
  value?: string;
  onPriorityChange?: (value: string) => void;
  statuses?: string[];
  onStatusesChange?: (values: string[]) => void;
  hideArchived?: boolean;
  onHideArchivedChange?: (val: boolean) => void;
  dueFrom?: string | null;
  dueTo?: string | null;
  onDueFromChange?: (val: string | null) => void;
  onDueToChange?: (val: string | null) => void;
  typeValue?: 'ALL' | 'REACTIVE' | 'REPEATING';
  onTypeChange?: (val: 'ALL' | 'REACTIVE' | 'REPEATING') => void;
  assets?: RemoteOption[];
  onAssetsChange?: (vals: RemoteOption[]) => void;
  categories?: RemoteOption[];
  onCategoriesChange?: (vals: RemoteOption[]) => void;
  teams?: RemoteOption[];
  onTeamsChange?: (vals: RemoteOption[]) => void;
  primaryUsers?: RemoteOption[];
  onPrimaryUsersChange?: (vals: RemoteOption[]) => void;
  locations?: RemoteOption[];
  onLocationsChange?: (vals: RemoteOption[]) => void;
  createdBy?: RemoteOption[];
  onCreatedByChange?: (vals: RemoteOption[]) => void;
  completedBy?: RemoteOption[];
  onCompletedByChange?: (vals: RemoteOption[]) => void;
  assigned_to?: RemoteOption[];
  onAssignedToChange?: (vals: RemoteOption[]) => void;
  customers?: RemoteOption[];
  onCustomersChange?: (vals: RemoteOption[]) => void;
  createdFrom?: string | null;
  createdTo?: string | null;
  onCreatedFromChange?: (val: string | null) => void;
  onCreatedToChange?: (val: string | null) => void;
  updatedFrom?: string | null;
  updatedTo?: string | null;
  onUpdatedFromChange?: (val: string | null) => void;
  onUpdatedToChange?: (val: string | null) => void;
  completedFrom?: string | null;
  completedTo?: string | null;
  onCompletedFromChange?: (val: string | null) => void;
  onCompletedToChange?: (val: string | null) => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = (value || (searchParams ? searchParams.get('priority') : null) || 'ALL').toUpperCase();

  const onChange = (v: string) => {
    if (onPriorityChange) {
      onPriorityChange(v);
      return;
    }
    const base = searchParams ? searchParams.toString() : '';
    const params = new URLSearchParams(base);
    if (v === 'ALL') params.delete('priority');
    else params.set('priority', v);
    params.set('page', '0');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="type-label">{t('type') || 'Type'}</InputLabel>
        <Select
          labelId="type-label"
          label={t('type') || 'Type'}
          value={typeValue}
          onChange={(e) => onTypeChange?.(e.target.value as any)}
        >
          {['ALL','REACTIVE','REPEATING'].map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <InputLabel id="priority-label">{t('priority_col')}</InputLabel>
        <Select
          labelId="priority-label"
          label={t('priority_col')}
          value={current}
          onChange={(e) => onChange(e.target.value)}
        >
          {priorities.map((p) => (
            <MenuItem key={p} value={p}>
              {p}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{t('status') || 'Status'}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(120px,1fr))' }}>
          {['OPEN','IN_PROGRESS','ON_HOLD','COMPLETE'].map((s) => (
            <FormControlLabel
              key={s}
              control={
                <Checkbox
                  checked={statuses.includes(s)}
                  onChange={(e) => {
                    if (!onStatusesChange) return;
                    const next = new Set(statuses);
                    if (e.target.checked) next.add(s);
                    else next.delete(s);
                    onStatusesChange(Array.from(next));
                  }}
                />
              }
              label={s}
            />
          ))}
        </div>
      </div>
      <Divider />
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{t('people') || 'People'}</div>
      <MultiRemoteSearchSelect
        label={t('primary_worker') || 'Primary Users'}
        placeholder={t('search_users') || 'Search users...'}
        value={primaryUsers}
        onChange={onPrimaryUsersChange || (() => {})}
        search={async (q) => {
          const criteria = {
            pageNum: 0,
            pageSize: 10,
            filterFields: q ? [{ field: 'email', operation: 'cn', value: q, alternatives: [
              { field: 'firstName', operation: 'cn', value: q },
              { field: 'lastName', operation: 'cn', value: q }
            ]}] : []
          };
          const res: any = await api('users/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((u: any) => ({ id: u.id, label: u.name || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim() }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('additional_workers') || 'Assigned To'}
        placeholder={t('search_users') || 'Search users...'}
        value={assigned_to}
        onChange={onAssignedToChange || (() => {})}
        search={async (q) => {
          const criteria = {
            pageNum: 0,
            pageSize: 10,
            filterFields: q ? [{ field: 'email', operation: 'cn', value: q, alternatives: [
              { field: 'firstName', operation: 'cn', value: q },
              { field: 'lastName', operation: 'cn', value: q }
            ]}] : []
          };
          const res: any = await api('users/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((u: any) => ({ id: u.id, label: u.name || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim() }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('customers') || 'Customers'}
        placeholder={t('search_customers') || 'Search customers...'}
        value={customers}
        onChange={onCustomersChange || (() => {})}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('customers/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((c: any) => ({ id: c.id, label: c.name || `#${c.id}` }));
        }}
      />
      <Divider />
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{t('assets_locations_teams') || 'Assets, Locations, Teams'}</div>
      <MultiRemoteSearchSelect
        label={t('assets') || 'Assets'}
        placeholder={t('search_assets') || 'Search assets...'}
        value={assets}
        onChange={onAssetsChange || (() => {})}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('assets/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('locations') || 'Locations'}
        placeholder={t('search_locations') || 'Search locations...'}
        value={locations}
        onChange={onLocationsChange || (() => {})}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('locations/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('teams') || 'Teams'}
        placeholder={t('search_teams') || 'Search teams...'}
        value={teams}
        onChange={onTeamsChange || (() => {})}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('teams/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
        }}
      />
      <Divider />
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{t('created_updated_completed') || 'Created/Updated/Completed'}</div>
      <Stack direction="row" spacing={2}>
        <TextField type="date" label={t('created_from') || 'Created from'} size="small" value={createdFrom || ''} onChange={(e) => onCreatedFromChange?.(e.target.value || null)} InputLabelProps={{ shrink: true }} />
        <TextField type="date" label={t('created_to') || 'Created to'} size="small" value={createdTo || ''} onChange={(e) => onCreatedToChange?.(e.target.value || null)} InputLabelProps={{ shrink: true }} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField type="date" label={t('updated_from') || 'Updated from'} size="small" value={updatedFrom || ''} onChange={(e) => onUpdatedFromChange?.(e.target.value || null)} InputLabelProps={{ shrink: true }} />
        <TextField type="date" label={t('updated_to') || 'Updated to'} size="small" value={updatedTo || ''} onChange={(e) => onUpdatedToChange?.(e.target.value || null)} InputLabelProps={{ shrink: true }} />
      </Stack>
      <Stack direction="row" spacing={2}>
        <TextField type="date" label={t('completed_from') || 'Completed from'} size="small" value={completedFrom || ''} onChange={(e) => onCompletedFromChange?.(e.target.value || null)} InputLabelProps={{ shrink: true }} />
        <TextField type="date" label={t('completed_to') || 'Completed to'} size="small" value={completedTo || ''} onChange={(e) => onCompletedToChange?.(e.target.value || null)} InputLabelProps={{ shrink: true }} />
      </Stack>
      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>Due date</div>
        <Stack direction="row" spacing={2}>
          <TextField
            type="date"
            label="From"
            size="small"
            value={dueFrom || ''}
            onChange={(e) => onDueFromChange?.(e.target.value || null)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="To"
            size="small"
            value={dueTo || ''}
            onChange={(e) => onDueToChange?.(e.target.value || null)}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </div>
      <FormControlLabel
        control={<Checkbox checked={hideArchived} onChange={(e) => onHideArchivedChange?.(e.target.checked)} />}
        label={t('hide_archived') || 'Hide archived'}
      />
    </Stack>
  );
}
