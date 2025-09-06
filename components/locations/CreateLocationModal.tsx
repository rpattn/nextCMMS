"use client";

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack } from '@mui/material';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';

export default function CreateLocationModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [parentLocation, setParentLocation] = useState<RemoteOption | null>(null);
  const [custom_id, setCustomId] = useState('');
  const [longitude, setLongitude] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');
  const [teams, setTeams] = useState<RemoteOption[]>([]);
  const [vendors, setVendors] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);
  const [workers, setWorkers] = useState<RemoteOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload: any = { name, address };
      if (parentLocation?.id) payload.parentLocation = { id: parentLocation.id };
      if (custom_id.trim()) payload.custom_id = custom_id.trim();
      payload.longitude = longitude.trim() ? Number(longitude) : null;
      payload.latitude = latitude.trim() ? Number(latitude) : null;
      if (teams.length) payload.teams = teams.map((t) => ({ id: t.id }));
      if (vendors.length) payload.vendors = vendors.map((v) => ({ id: v.id }));
      if (customers.length) payload.customers = customers.map((c) => ({ id: c.id }));
      if (workers.length) payload.workers = workers.map((w) => ({ id: w.id }));
      await api('locations', { method: 'POST', body: JSON.stringify(payload) });
      onClose();
      onCreated?.();
      setName(''); setAddress(''); setParentLocation(null);
      setCustomId(''); setLongitude(''); setLatitude('');
      setTeams([]); setVendors([]); setCustomers([]); setWorkers([]);
    } catch (e) {
      alert('Failed to create location');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('add_location') || 'Add Location'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label={t('name') || 'Name'} value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          <TextField label={t('address') || 'Address'} value={address} onChange={(e) => setAddress(e.target.value)} fullWidth multiline minRows={2} />
          <TextField label={t('custom_id') || 'Custom ID'} value={custom_id} onChange={(e) => setCustomId(e.target.value)} fullWidth />
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>{t('cancel') || 'Cancel'}</Button>
        <Button variant="contained" onClick={submit} disabled={submitting || !name.trim()}>{t('add_location') || 'Add Location'}</Button>
      </DialogActions>
    </Dialog>
  );
}
