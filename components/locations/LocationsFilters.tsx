"use client";

import { Stack, TextField, Divider } from '@mui/material';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';

export default function LocationsFilters({
  parentLocation,
  onParentLocationChange,
  address,
  onAddressChange,
  custom_id,
  onCustomIdChange,
  hasChildren,
  onHasChildrenChange,
  teams,
  onTeamsChange,
  vendors,
  onVendorsChange,
  customers,
  onCustomersChange,
  workers,
  onWorkersChange,
  createdFrom,
  createdTo,
  onCreatedFromChange,
  onCreatedToChange,
  updatedFrom,
  updatedTo,
  onUpdatedFromChange,
  onUpdatedToChange
}: {
  parentLocation: RemoteOption | null;
  onParentLocationChange: (val: RemoteOption | null) => void;
  address: string | null;
  onAddressChange: (v: string | null) => void;
  custom_id: string | null;
  onCustomIdChange: (v: string | null) => void;
  hasChildren: boolean | null;
  onHasChildrenChange: (v: boolean | null) => void;
  teams: RemoteOption[];
  onTeamsChange: (vals: RemoteOption[]) => void;
  vendors: RemoteOption[];
  onVendorsChange: (vals: RemoteOption[]) => void;
  customers: RemoteOption[];
  onCustomersChange: (vals: RemoteOption[]) => void;
  workers: RemoteOption[];
  onWorkersChange: (vals: RemoteOption[]) => void;
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
      <RemoteSearchSelect
        label={t('parent_location') || 'Parent Location'}
        placeholder={t('search_locations') || 'Search locations...'}
        value={parentLocation}
        onChange={onParentLocationChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
          const res: any = await api('locations/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
        }}
      />
      <TextField label={t('address') || 'Address'} size="small" value={address || ''} onChange={(e) => onAddressChange(e.target.value)} />
      <TextField label={t('custom_id') || 'Custom ID'} size="small" value={custom_id || ''} onChange={(e) => onCustomIdChange(e.target.value)} />
      <TextField label={t('has_children') || 'Has Children'} size="small" select value={hasChildren === null ? 'any' : hasChildren ? 'yes' : 'no'} onChange={(e) => onHasChildrenChange(e.target.value === 'any' ? null : e.target.value === 'yes')}>
        <option value="any">{t('any') || 'Any'}</option>
        <option value="yes">{t('yes') || 'Yes'}</option>
        <option value="no">{t('no') || 'No'}</option>
      </TextField>

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
        label={t('workers') || 'Workers'}
        placeholder={t('search_users') || 'Search users...'}
        value={workers}
        onChange={onWorkersChange}
        search={async (q) => {
          const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'email', operation: 'cn', value: q, alternatives: [ { field: 'firstName', operation: 'cn', value: q }, { field: 'lastName', operation: 'cn', value: q } ] }] : [] };
          const res: any = await api('users/search', { method: 'POST', body: JSON.stringify(criteria) });
          const content = res?.content || [];
          return content.map((u: any) => ({ id: u.id, label: u.name || u.email || `${u.firstName || ''} ${u.lastName || ''}`.trim() }));
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

