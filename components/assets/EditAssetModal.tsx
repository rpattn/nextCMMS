"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';

type Asset = {
  id: number;
  name?: string;
  description?: string;
  status?: 'OPERATIONAL' | 'DOWN' | 'INACTIVE' | 'DISPOSED' | string;
  location?: { id: number; name?: string } | null;
  model?: string | null;
  area?: string | null;
  team?: { id: number; name?: string } | null;
  primaryUser?: { id: number; name?: string; firstName?: string; lastName?: string } | null;
  assigned_to?: Array<{ id: number; name?: string; firstName?: string; lastName?: string }>;
  customers?: Array<{ id: number; name?: string }>;
  vendors?: Array<{ id: number; name?: string }>;
  parentAsset?: { id: number; name?: string } | null;
  serialNumber?: string | null;
  barCode?: string | null;
  manufacturer?: string | null;
  power?: string | null;
  acquisitionCost?: number | null;
  custom_id?: string | null;
  inServiceDate?: string | null;
  warrantyExpirationDate?: string | null;
  additionalInfos?: string | null;
};

export default function EditAssetModal({ id, open, onClose, onSaved }: { id: number; open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState<Asset | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<RemoteOption | null>(null);
  const [team, setTeam] = useState<RemoteOption | null>(null);
  const [primaryUser, setPrimaryUser] = useState<RemoteOption | null>(null);
  const [assigned_to, setAssignedTo] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);
  const [vendors, setVendors] = useState<RemoteOption[]>([]);
  const [parentAsset, setParentAsset] = useState<RemoteOption | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [barCode, setBarCode] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [power, setPower] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [custom_id, setCustomId] = useState('');
  const [inServiceDate, setInServiceDate] = useState('');
  const [warrantyExpirationDate, setWarrantyExpirationDate] = useState('');
  const [additionalInfos, setAdditionalInfos] = useState('');

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const data = await api<Asset>(`assets/${id}`);
        if (!active) return;
        const next: Asset = {
          id,
          name: data.name || '',
          description: data.description || '',
          status: (data.status as any) || 'ACTIVE',
          location: data.location || null,
          model: (data as any).model || null,
          area: (data as any).area || null,
          team: (data as any).team || null,
          primaryUser: (data as any).primaryUser || null,
          assigned_to: (data as any).assigned_to || [],
          customers: (data as any).customers || [],
          vendors: (data as any).vendors || [],
          parentAsset: (data as any).parentAsset || null,
          serialNumber: (data as any).serialNumber || null,
          barCode: (data as any).barCode || null,
          manufacturer: (data as any).manufacturer || null,
          power: (data as any).power || null,
          acquisitionCost: (data as any).acquisitionCost ?? null,
          custom_id: (data as any).custom_id || null,
          inServiceDate: (data as any).inServiceDate || null,
          warrantyExpirationDate: (data as any).warrantyExpirationDate || null,
          additionalInfos: (data as any).additionalInfos || null
        };
        setForm(next);
        setLocation(next.location ? { id: next.location.id, label: next.location.name || `#${next.location.id}` } : null);
        setTeam(next.team ? { id: next.team.id, label: next.team.name || `#${next.team.id}` } : null);
        setPrimaryUser(next.primaryUser ? { id: next.primaryUser.id, label: next.primaryUser.name || `${next.primaryUser.firstName || ''} ${next.primaryUser.lastName || ''}`.trim() || `#${next.primaryUser.id}` } : null);
        setAssignedTo((next.assigned_to || []).map((u) => ({ id: u.id, label: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || `#${u.id}` })));
        setCustomers((next.customers || []).map((c) => ({ id: c.id, label: c.name || `#${c.id}` })));
        setVendors((next.vendors || []).map((v) => ({ id: v.id, label: v.name || `#${v.id}` })));
        setParentAsset(next.parentAsset ? { id: next.parentAsset.id, label: next.parentAsset.name || `#${next.parentAsset.id}` } : null);
        setSerialNumber(next.serialNumber || '');
        setBarCode(next.barCode || '');
        setManufacturer(next.manufacturer || '');
        setPower(next.power || '');
        setAcquisitionCost(next.acquisitionCost != null ? String(next.acquisitionCost) : '');
        setCustomId(next.custom_id || '');
        setInServiceDate(next.inServiceDate ? String(next.inServiceDate).substring(0,10) : '');
        setWarrantyExpirationDate(next.warrantyExpirationDate ? String(next.warrantyExpirationDate).substring(0,10) : '');
        setAdditionalInfos(next.additionalInfos || '');
      } catch (e) { console.error(e); }
    })();
    return () => { active = false; };
  }, [id, open]);

  const onChange = (patch: Partial<Asset>) => setForm((prev) => ({ ...(prev || ({} as Asset)), ...patch }));

  const submit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const payload: any = { name: form.name, description: form.description, status: form.status };
      payload.model = form.model || null;
      payload.area = form.area || null;
      if (location?.id) payload.location = { id: location.id }; else payload.location = null;
      if (team?.id) payload.team = { id: team.id }; else payload.team = null;
      if (primaryUser?.id) payload.primaryUser = { id: primaryUser.id }; else payload.primaryUser = null;
      payload.assigned_to = assigned_to.map((u) => ({ id: u.id }));
      payload.customers = customers.map((c) => ({ id: c.id }));
      payload.vendors = vendors.map((v) => ({ id: v.id }));
      if (parentAsset?.id) payload.parentAsset = { id: parentAsset.id }; else payload.parentAsset = null;
      payload.serialNumber = serialNumber || null;
      payload.barCode = barCode || null;
      payload.manufacturer = manufacturer || null;
      payload.power = power || null;
      payload.acquisitionCost = acquisitionCost.trim() ? Number(acquisitionCost) : null;
      payload.custom_id = custom_id.trim() || null;
      payload.inServiceDate = inServiceDate || null;
      payload.warrantyExpirationDate = warrantyExpirationDate || null;
      payload.additionalInfos = additionalInfos || null;
      await api(`assets/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      onClose();
      onSaved?.();
    } catch (e) {
      alert('Failed to save asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('edit_asset') || 'Edit Asset'}</DialogTitle>
      <DialogContent>
        {form && (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('name') || 'Name'} value={form.name} onChange={(e) => onChange({ name: e.target.value })} fullWidth required />
            <TextField label={t('status') || 'Status'} value={form.status} onChange={(e) => onChange({ status: e.target.value as any })} select fullWidth>
              {['OPERATIONAL','DOWN','INACTIVE','DISPOSED'].map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField label={t('model') || 'Model'} value={form.model || ''} onChange={(e) => onChange({ model: e.target.value })} fullWidth />
            <TextField label={t('area') || 'Area'} value={form.area || ''} onChange={(e) => onChange({ area: e.target.value })} fullWidth />
            <RemoteSearchSelect
              label={t('parent_asset') || 'Parent Asset'}
              placeholder={t('search_assets') || 'Search assets...'}
              value={parentAsset}
              onChange={setParentAsset}
              search={async (q) => {
                const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
                const res: any = await api('assets/search', { method: 'POST', body: JSON.stringify(criteria) });
                const content = res?.content || [];
                return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
              }}
            />
            <RemoteSearchSelect
              label={t('location') || 'Location'}
              placeholder={t('search_locations') || 'Search locations...'}
              value={location}
              onChange={setLocation}
              search={async (q) => {
                const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
                const res: any = await api('locations/search', { method: 'POST', body: JSON.stringify(criteria) });
                const content = res?.content || [];
                return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
              }}
            />
            <RemoteSearchSelect
              label={t('team') || 'Team'}
              placeholder={t('search_teams') || 'Search teams...'}
              value={team}
              onChange={setTeam}
              search={async (q) => {
                const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
                const res: any = await api('teams/search', { method: 'POST', body: JSON.stringify(criteria) });
                const content = res?.content || [];
                return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
              }}
            />
            <RemoteSearchSelect
              label={t('primary_worker') || 'Primary User'}
              placeholder={t('search_users') || 'Search users...'}
              value={primaryUser}
              onChange={setPrimaryUser}
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
              label={t('additional_workers') || 'Additional Workers'}
              placeholder={t('search_users') || 'Search users...'}
              value={assigned_to}
              onChange={setAssignedTo}
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
              onChange={setCustomers}
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
              onChange={setVendors}
              search={async (q) => {
                const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
                const res: any = await api('vendors/search', { method: 'POST', body: JSON.stringify(criteria) });
                const content = res?.content || [];
                return content.map((v: any) => ({ id: v.id, label: v.name || `#${v.id}` }));
              }}
            />
            <TextField label={t('serial_number') || 'Serial Number'} value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} fullWidth />
            <TextField label={t('barcode') || 'Barcode'} value={barCode} onChange={(e) => setBarCode(e.target.value)} fullWidth />
            <TextField label={t('manufacturer') || 'Manufacturer'} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} fullWidth />
            <TextField label={t('power') || 'Power'} value={power} onChange={(e) => setPower(e.target.value)} fullWidth />
            <TextField label={t('acquisition_cost') || 'Acquisition Cost'} type="number" value={acquisitionCost} onChange={(e) => setAcquisitionCost(e.target.value)} fullWidth />
            <TextField label={t('custom_id') || 'Custom ID'} value={custom_id} onChange={(e) => setCustomId(e.target.value)} fullWidth />
            <TextField label={t('in_service_date') || 'In Service Date'} type="date" value={inServiceDate} onChange={(e) => setInServiceDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label={t('warranty_expiration_date') || 'Warranty Expiration'} type="date" value={warrantyExpirationDate} onChange={(e) => setWarrantyExpirationDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label={t('description') || 'Description'} value={form.description} onChange={(e) => onChange({ description: e.target.value })} fullWidth multiline minRows={3} />
            <TextField label={t('additional_infos') || 'Additional Infos'} value={additionalInfos} onChange={(e) => setAdditionalInfos(e.target.value)} fullWidth multiline minRows={2} />
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
