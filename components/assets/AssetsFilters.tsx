"use client";

import { Stack, TextField, Divider, MenuItem } from '@mui/material';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';

export default function AssetsFilters({
  hideArchived,
  onHideArchivedChange,
  statuses,
  onStatusesChange,
  locations,
  onLocationsChange,
  area,
  onAreaChange,
  model,
  onModelChange,
  teams,
  onTeamsChange,
  primaryUsers,
  onPrimaryUsersChange,
  assignedTo,
  onAssignedToChange,
  customers,
  onCustomersChange,
  vendors,
  onVendorsChange,
  createdFrom,
  createdTo,
  onCreatedFromChange,
  onCreatedToChange,
  updatedFrom,
  updatedTo,
  onUpdatedFromChange,
  onUpdatedToChange
}: {
  hideArchived: boolean;
  onHideArchivedChange: (val: boolean) => void;
  statuses: string[];
  onStatusesChange: (vals: string[]) => void;
  locations: RemoteOption[];
  onLocationsChange: (vals: RemoteOption[]) => void;
  area: string | null;
  onAreaChange: (v: string | null) => void;
  model: string | null;
  onModelChange: (v: string | null) => void;
  teams: RemoteOption[];
  onTeamsChange: (vals: RemoteOption[]) => void;
  primaryUsers: RemoteOption[];
  onPrimaryUsersChange: (vals: RemoteOption[]) => void;
  assignedTo: RemoteOption[];
  onAssignedToChange: (vals: RemoteOption[]) => void;
  customers: RemoteOption[];
  onCustomersChange: (vals: RemoteOption[]) => void;
  vendors: RemoteOption[];
  onVendorsChange: (vals: RemoteOption[]) => void;
  createdFrom: string | null;
  createdTo: string | null;
  onCreatedFromChange: (v: string | null) => void;
  onCreatedToChange: (v: string | null) => void;
  updatedFrom: string | null;
  updatedTo: string | null;
  onUpdatedFromChange: (v: string | null) => void;
  onUpdatedToChange: (v: string | null) => void;
}) {
  const { t } = useI18n();
  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        label={t('archived') || 'Archived'}
        select
        size="small"
        value={hideArchived ? 'HIDE' : 'ALL'}
        onChange={(e) => onHideArchivedChange(e.target.value === 'HIDE')}
      >
        <MenuItem value="ALL">{t('show_all') || 'Show all'}</MenuItem>
        <MenuItem value="HIDE">{t('hide_archived') || 'Hide archived'}</MenuItem>
      </TextField>

      {false && (
        <TextField label={t('status') || 'Status'} select size="small" SelectProps={{ multiple: true }} value={statuses} onChange={(e) => onStatusesChange(typeof e.target.value === 'string' ? e.target.value.split(',') : (e.target.value as string[]))}>
          {['OPERATIONAL','MODERNIZATION','DOWN','STANDBY','INSPECTION_SCHEDULED','COMMISSIONING','EMERGENCY_SHUTDOWN'].map((s) => (
            // eslint-disable-next-line react/jsx-key
            <option value={s}>{s}</option>
          ))}
        </TextField>
      )}

      <Divider />

      <MultiRemoteSearchSelect
        label={t('locations') || 'Locations'}
        placeholder={t('search_locations') || 'Search locations...'}
        value={locations}
        onChange={onLocationsChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('locations/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
        }}
      />
      <TextField label={t('area') || 'Area'} size="small" value={area || ''} onChange={(e) => onAreaChange(e.target.value)} />
      <TextField label={t('model') || 'Model'} size="small" value={model || ''} onChange={(e) => onModelChange(e.target.value)} />

      <Divider />

      <MultiRemoteSearchSelect
        label={t('teams') || 'Teams'}
        placeholder={t('search_teams') || 'Search teams...'}
        value={teams}
        onChange={onTeamsChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('teams/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('primary_workers') || 'Primary Users'}
        placeholder={t('search_users') || 'Search users...'}
        value={primaryUsers}
        onChange={onPrimaryUsersChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'email', operation: 'cn', value: q, alternatives: [ { field: 'firstName', operation: 'cn', value: q }, { field: 'lastName', operation: 'cn', value: q } ] }] : [] };
          const res: any = await api('users/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((u: any) => ({ id: u.id, label: u.name || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim() }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('additional_workers') || 'Additional Workers'}
        placeholder={t('search_users') || 'Search users...'}
        value={assignedTo}
        onChange={onAssignedToChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'email', operation: 'cn', value: q, alternatives: [ { field: 'firstName', operation: 'cn', value: q }, { field: 'lastName', operation: 'cn', value: q } ] }] : [] };
          const res: any = await api('users/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((u: any) => ({ id: u.id, label: u.name || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim() }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('customers') || 'Customers'}
        placeholder={t('search_customers') || 'Search customers...'}
        value={customers}
        onChange={onCustomersChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('customers/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((c: any) => ({ id: c.id, label: c.name || `#${c.id}` }));
        }}
      />
      <MultiRemoteSearchSelect
        label={t('vendors') || 'Vendors'}
        placeholder={t('search_vendors') || 'Search vendors...'}
        value={vendors}
        onChange={onVendorsChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('vendors/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((v: any) => ({ id: v.id, label: v.name || `#${v.id}` }));
        }}
      />

      <Divider />
      <TextField label={t('created_from') || 'Created From'} size="small" type="date" value={createdFrom || ''} onChange={(e) => onCreatedFromChange(e.target.value || null)} InputLabelProps={{ shrink: true }} />
      <TextField label={t('created_to') || 'Created To'} size="small" type="date" value={createdTo || ''} onChange={(e) => onCreatedToChange(e.target.value || null)} InputLabelProps={{ shrink: true }} />
      <TextField label={t('updated_from') || 'Updated From'} size="small" type="date" value={updatedFrom || ''} onChange={(e) => onUpdatedFromChange(e.target.value || null)} InputLabelProps={{ shrink: true }} />
      <TextField label={t('updated_to') || 'Updated To'} size="small" type="date" value={updatedTo || ''} onChange={(e) => onUpdatedToChange(e.target.value || null)} InputLabelProps={{ shrink: true }} />
    </Stack>
  );
}
