"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack, FormControlLabel, Checkbox } from '@mui/material';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';

export default function CreateWorkOrderModal({ open, onClose, onCreated, initialdue_date }: { open: boolean; onClose: () => void; onCreated?: () => void; initialdue_date?: Date | string | null }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [due_date, setdue_date] = useState<string>('');
  const [description, setDescription] = useState('');
  const [estimated_start_date, setestimated_start_date] = useState<string>('');
  const [estimated_duration, setEstimatedDuration] = useState<string>('');
  const [requiredSignature, setRequiredSignature] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [primaryUser, setPrimaryUser] = useState<RemoteOption | null>(null);
  const [location, setLocation] = useState<RemoteOption | null>(null);
  const [team, setTeam] = useState<RemoteOption | null>(null);
  const [asset, setAsset] = useState<RemoteOption | null>(null);
  const [assigned_to, setAssignedTo] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);

  // Prefill due date if provided when opening
  useEffect(() => {
    if (!open) return;
    if (!initialdue_date) return;
    try {
      const d = typeof initialdue_date === 'string' ? new Date(initialdue_date) : initialdue_date;
      if (!isNaN(d.getTime())) {
        // YYYY-MM-DD
        const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
          .toISOString()
          .slice(0, 10);
        setdue_date(iso);
      }
    } catch {}
  }, [open, initialdue_date]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload: any = { title, priority, description };
      if (due_date) payload.due_date = due_date;
      if (estimated_start_date) payload.estimated_start_date = estimated_start_date;
      if (estimated_duration) payload.estimated_duration = Number(estimated_duration);
      payload.requiredSignature = !!requiredSignature;
      if (primaryUser?.id) payload.primaryUser = primaryUser.id;
      if (location?.id) payload.location = location.id;
      if (team?.id) payload.team = team.id;
      if (asset?.id) payload.asset = asset.id;
      if (assigned_to.length) payload.assigned_to = assigned_to.map((u) => (u.id));
      if (customers.length) payload.customers = customers.map((c) => ({ id: c.id }));
      await api('work-orders', { method: 'POST', body: JSON.stringify(payload) });
      onClose();
      onCreated?.();
      setTitle(''); setDescription(''); setdue_date(''); setPriority('LOW'); setestimated_start_date(''); setEstimatedDuration(''); setRequiredSignature(false);
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
          <TextField label={t('due_col') || 'Due'} type="date" value={due_date} onChange={(e) => setdue_date(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label={t('estimated_start_date') || 'Estimated Start'} type="date" value={estimated_start_date} onChange={(e) => setestimated_start_date(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label={t('estimated_duration') || 'Estimated Duration (h)'} type="number" inputProps={{ step: '0.25', min: '0' }} value={estimated_duration} onChange={(e) => setEstimatedDuration(e.target.value)} fullWidth />
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
              //console.log(content)
              return content.map((u: any) => ({ id: u.ID, label: u.Email || u.Name || `${u.Name || ''} ${u.Name || ''}`.trim() }));
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
              //console.log(res)
              const content = res?.content || [];
              return content.map((u: any) => ({ id: u.ID, label: u.Email || `${u.Name || ''} ${u.Email  }` }));
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
