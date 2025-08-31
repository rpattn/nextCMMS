"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';

type Location = {
  id: number;
  name?: string;
  address?: string;
  parentLocation?: { id: number; name?: string } | null;
  customId?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  teams?: Array<{ id: number; name?: string }>;
  vendors?: Array<{ id: number; name?: string }>;
  customers?: Array<{ id: number; name?: string }>;
  workers?: Array<{ id: number; name?: string; firstName?: string; lastName?: string }>;
};

export default function EditLocationModal({ id, open, onClose, onSaved }: { id: number; open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState<Location | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [parentLocation, setParentLocation] = useState<RemoteOption | null>(null);
  const [customId, setCustomId] = useState('');
  const [longitude, setLongitude] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [teams, setTeams] = useState<RemoteOption[]>([]);
  const [vendors, setVendors] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);
  const [workers, setWorkers] = useState<RemoteOption[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const data = await api<Location>(`locations/${id}`);
        if (!active) return;
        setForm({ id, name: data.name || '', address: data.address || '', parentLocation: data.parentLocation || null, customId: (data as any).customId || null, longitude: (data as any).longitude ?? null, latitude: (data as any).latitude ?? null, teams: (data as any).teams || [], vendors: (data as any).vendors || [], customers: (data as any).customers || [], workers: (data as any).workers || [] });
        setParentLocation(data.parentLocation ? { id: data.parentLocation.id, label: data.parentLocation.name || `#${data.parentLocation.id}` } : null);
        setCustomId((data as any).customId || '');
        setLongitude((data as any).longitude != null ? String((data as any).longitude) : '');
        setLatitude((data as any).latitude != null ? String((data as any).latitude) : '');
        setTeams(((data as any).teams || []).map((t: any) => ({ id: t.id, label: t.name || `#${t.id}` })));
        setVendors(((data as any).vendors || []).map((v: any) => ({ id: v.id, label: v.name || `#${v.id}` })));
        setCustomers(((data as any).customers || []).map((c: any) => ({ id: c.id, label: c.name || `#${c.id}` })));
        setWorkers(((data as any).workers || []).map((u: any) => ({ id: u.id, label: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || `#${u.id}` })));
      } catch (e) { console.error(e); }
    })();
    return () => { active = false; };
  }, [id, open]);

  const onChange = (patch: Partial<Location>) => setForm((prev) => ({ ...(prev || ({} as Location)), ...patch }));

  const submit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const payload: any = { name: form.name, address: form.address };
      if (parentLocation?.id) payload.parentLocation = { id: parentLocation.id }; else payload.parentLocation = null;
      payload.customId = customId.trim() || null;
      payload.longitude = longitude.trim() ? Number(longitude) : null;
      payload.latitude = latitude.trim() ? Number(latitude) : null;
      payload.teams = teams.map((t) => ({ id: t.id }));
      payload.vendors = vendors.map((v) => ({ id: v.id }));
      payload.customers = customers.map((c) => ({ id: c.id }));
      payload.workers = workers.map((u) => ({ id: u.id }));
      await api(`locations/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      onClose();
      onSaved?.();
    } catch (e) {
      alert('Failed to save location');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('edit_location') || 'Edit Location'}</DialogTitle>
      <DialogContent>
        {form && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('name') || 'Name'} value={form.name} onChange={(e) => onChange({ name: e.target.value })} fullWidth required />
            <TextField label={t('address') || 'Address'} value={form.address} onChange={(e) => onChange({ address: e.target.value })} fullWidth multiline minRows={2} />
            <TextField label={t('custom_id') || 'Custom ID'} value={customId} onChange={(e) => setCustomId(e.target.value)} fullWidth />
            <TextField label={t('longitude') || 'Longitude'} type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} fullWidth />
            <TextField label={t('latitude') || 'Latitude'} type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} fullWidth />
            <RemoteSearchSelect
              label={t('parent_location') || 'Parent Location'}
              placeholder={t('search_locations') || 'Search locations...'}
              value={parentLocation}
              onChange={setParentLocation}
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
              onChange={setTeams}
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
              onChange={setVendors}
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
              onChange={setCustomers}
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
              onChange={setWorkers}
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
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>{t('cancel') || 'Cancel'}</Button>
        <Button variant="contained" onClick={submit} disabled={submitting || !form || !form.name?.trim()}>{t('save') || 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
