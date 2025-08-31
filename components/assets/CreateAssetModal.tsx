"use client";

import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack } from '@mui/material';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';

export default function CreateAssetModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'OPERATIONAL' | 'DOWN' | 'INACTIVE' | 'DISPOSED' | string>('OPERATIONAL');
  const [location, setLocation] = useState<RemoteOption | null>(null);
  const [model, setModel] = useState('');
  const [area, setArea] = useState('');
  const [team, setTeam] = useState<RemoteOption | null>(null);
  const [primaryUser, setPrimaryUser] = useState<RemoteOption | null>(null);
  const [assignedTo, setAssignedTo] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);
  const [vendors, setVendors] = useState<RemoteOption[]>([]);
  const [parentAsset, setParentAsset] = useState<RemoteOption | null>(null);
  const [serialNumber, setSerialNumber] = useState('');
  const [barCode, setBarCode] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [power, setPower] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [customId, setCustomId] = useState('');
  const [inServiceDate, setInServiceDate] = useState('');
  const [warrantyExpirationDate, setWarrantyExpirationDate] = useState('');
  const [additionalInfos, setAdditionalInfos] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload: any = { name, description, status };
      if (model) payload.model = model;
      if (area) payload.area = area;
      if (location?.id) payload.location = { id: location.id };
      if (team?.id) payload.team = { id: team.id };
      if (primaryUser?.id) payload.primaryUser = { id: primaryUser.id };
      if (assignedTo.length) payload.assignedTo = assignedTo.map((u) => ({ id: u.id }));
      if (customers.length) payload.customers = customers.map((c) => ({ id: c.id }));
      if (vendors.length) payload.vendors = vendors.map((v) => ({ id: v.id }));
      if (parentAsset?.id) payload.parentAsset = { id: parentAsset.id };
      if (serialNumber) payload.serialNumber = serialNumber;
      if (barCode) payload.barCode = barCode;
      if (manufacturer) payload.manufacturer = manufacturer;
      payload.power = power.trim() ? power : null;
      payload.acquisitionCost = acquisitionCost.trim() ? Number(acquisitionCost) : null;
      if (customId.trim()) payload.customId = customId.trim();
      payload.inServiceDate = inServiceDate || null;
      payload.warrantyExpirationDate = warrantyExpirationDate || null;
      if (additionalInfos) payload.additionalInfos = additionalInfos;
      await api('assets', { method: 'POST', body: JSON.stringify(payload) });
      onClose();
      onCreated?.();
      setName(''); setDescription(''); setStatus('OPERATIONAL'); setLocation(null); setModel(''); setArea(''); setTeam(null); setPrimaryUser(null); setAssignedTo([]); setCustomers([]); setVendors([]); setParentAsset(null); setSerialNumber(''); setBarCode(''); setManufacturer(''); setPower(''); setAcquisitionCost(''); setCustomId(''); setInServiceDate(''); setWarrantyExpirationDate(''); setAdditionalInfos('');
    } catch (e) {
      alert('Failed to create asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('add_asset') || 'Add Asset'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label={t('name') || 'Name'} value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
          <TextField label={t('status') || 'Status'} value={status} onChange={(e) => setStatus(e.target.value as any)} select fullWidth>
            {['OPERATIONAL','DOWN','INACTIVE','DISPOSED'].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
          <TextField label={t('model') || 'Model'} value={model} onChange={(e) => setModel(e.target.value)} fullWidth />
          <TextField label={t('area') || 'Area'} value={area} onChange={(e) => setArea(e.target.value)} fullWidth />
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
            value={assignedTo}
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
          <TextField label={t('custom_id') || 'Custom ID'} value={customId} onChange={(e) => setCustomId(e.target.value)} fullWidth />
          <TextField label={t('in_service_date') || 'In Service Date'} type="date" value={inServiceDate} onChange={(e) => setInServiceDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label={t('warranty_expiration_date') || 'Warranty Expiration'} type="date" value={warrantyExpirationDate} onChange={(e) => setWarrantyExpirationDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label={t('description') || 'Description'} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
          <TextField label={t('additional_infos') || 'Additional Infos'} value={additionalInfos} onChange={(e) => setAdditionalInfos(e.target.value)} fullWidth multiline minRows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>{t('cancel') || 'Cancel'}</Button>
        <Button variant="contained" onClick={submit} disabled={submitting || !name.trim()}>{t('add_asset') || 'Add Asset'}</Button>
      </DialogActions>
    </Dialog>
  );
}
