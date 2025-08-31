"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack, FormControlLabel, Checkbox } from '@mui/material';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';

export default function CreateWorkOrderModal({ open, onClose, onCreated, initialDueDate }: { open: boolean; onClose: () => void; onCreated?: () => void; initialDueDate?: Date | string | null }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState('');
  const [estimatedStartDate, setEstimatedStartDate] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');
  const [requiredSignature, setRequiredSignature] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [primaryUser, setPrimaryUser] = useState<RemoteOption | null>(null);
  const [location, setLocation] = useState<RemoteOption | null>(null);
  const [team, setTeam] = useState<RemoteOption | null>(null);
  const [asset, setAsset] = useState<RemoteOption | null>(null);
  const [assignedTo, setAssignedTo] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);

  // Prefill due date if provided when opening
  useEffect(() => {
    if (!open) return;
    if (!initialDueDate) return;
    try {
      const d = typeof initialDueDate === 'string' ? new Date(initialDueDate) : initialDueDate;
      if (!isNaN(d.getTime())) {
        // YYYY-MM-DD
        const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
          .toISOString()
          .slice(0, 10);
        setDueDate(iso);
      }
    } catch {}
  }, [open, initialDueDate]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload: any = { title, priority, description };
      if (dueDate) payload.dueDate = dueDate;
      if (estimatedStartDate) payload.estimatedStartDate = estimatedStartDate;
      if (estimatedDuration) payload.estimatedDuration = Number(estimatedDuration);
      payload.requiredSignature = !!requiredSignature;
      if (primaryUser?.id) payload.primaryUser = { id: primaryUser.id };
      if (location?.id) payload.location = { id: location.id };
      if (team?.id) payload.team = { id: team.id };
      if (asset?.id) payload.asset = { id: asset.id };
      if (assignedTo.length) payload.assignedTo = assignedTo.map((u) => ({ id: u.id }));
      if (customers.length) payload.customers = customers.map((c) => ({ id: c.id }));
      await api('work-orders', { method: 'POST', body: JSON.stringify(payload) });
      onClose();
      onCreated?.();
      setTitle(''); setDescription(''); setDueDate(''); setPriority('LOW'); setEstimatedStartDate(''); setEstimatedDuration(''); setRequiredSignature(false);
      setPrimaryUser(null); setLocation(null); setTeam(null); setAsset(null); setAssignedTo([]); setCustomers([]);
    } catch (e) {
      alert('Failed to create work order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('add_work_order') || 'Add Work Order'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label={t('title_col') || 'Title'} value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required />
          <TextField label={t('priority_col') || 'Priority'} value={priority} onChange={(e) => setPriority(e.target.value as any)} select fullWidth>
            {['NONE','LOW','MEDIUM','HIGH'].map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
          <TextField label={t('due_col') || 'Due'} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label={t('estimated_start_date') || 'Estimated Start'} type="date" value={estimatedStartDate} onChange={(e) => setEstimatedStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label={t('estimated_duration') || 'Estimated Duration (h)'} type="number" inputProps={{ step: '0.25', min: '0' }} value={estimatedDuration} onChange={(e) => setEstimatedDuration(e.target.value)} fullWidth />
          <FormControlLabel control={<Checkbox checked={requiredSignature} onChange={(e) => setRequiredSignature(e.target.checked)} />} label={t('required_signature') || 'Required Signature'} />
          <TextField label={t('description') || 'Description'} value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline minRows={3} />
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
            label={t('asset') || 'Asset'}
            placeholder={t('search_assets') || 'Search assets...'}
            value={asset}
            onChange={setAsset}
            search={async (q) => {
              const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
              const res: any = await api('assets/search', { method: 'POST', body: JSON.stringify(criteria) });
              const content = res?.content || [];
              return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
            }}
          />
          <MultiRemoteSearchSelect
            label={t('assigned_to') || 'Assigned To'}
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
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>{t('cancel') || 'Cancel'}</Button>
        <Button variant="contained" onClick={submit} disabled={submitting || !title.trim()}>{t('add_work_order') || 'Add Work Order'}</Button>
      </DialogActions>
    </Dialog>
  );
}
