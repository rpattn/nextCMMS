"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Stack, FormControlLabel, Checkbox } from '@mui/material';
import { api } from '@/lib/api';
import { useI18n } from '@/components/providers/I18nProvider';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';
import MultiRemoteSearchSelect from '@/components/common/MultiRemoteSearchSelect';

type WorkOrder = {
  id: string;
  title?: string;
  description?: string;
  priority?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | string;
  due_date?: string;
  estimated_start_date?: string | null;
  estimated_duration?: number | null;
  requiredSignature?: boolean;
  archived?: boolean;
  primary_worker?: { id: number; name?: string; email?: string } | null;
  location?: { id: number; name?: string } | null;
  team?: { id: number; name?: string } | null;
  asset?: { id: number; name?: string } | null;
  assignedTo?: Array<{ id: number; name?: string; firstName?: string; lastName?: string }>;
  customers?: Array<{ id: number; name?: string }>;
};

export default function EditWorkOrderModal({ id, open, onClose, onSaved }: { id: string; open: boolean; onClose: () => void; onSaved?: () => void }) {
  const { t } = useI18n();
  const [form, setForm] = useState<WorkOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [primaryUser, setPrimaryUser] = useState<RemoteOption | null>(null);
  const [location, setLocation] = useState<RemoteOption | null>(null);
  const [team, setTeam] = useState<RemoteOption | null>(null);
  const [asset, setAsset] = useState<RemoteOption | null>(null);
  const [assignedTo, setAssignedTo] = useState<RemoteOption[]>([]);
  const [customers, setCustomers] = useState<RemoteOption[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      try {
        const data = await api<WorkOrder>(`work-orders/${id}`);
        if (!active) return;
        const nextForm: WorkOrder = {
          id,
          title: data.title || '',
          description: data.description || '',
          priority: (data.priority as any) || 'LOW',
          due_date: data.due_date ? (data.due_date as string).substring(0, 10) : '',
          estimated_start_date: data.estimated_start_date ? (data.estimated_start_date as string).substring(0, 10) : '',
          estimated_duration: data.estimated_duration ?? null,
          requiredSignature: !!data.requiredSignature,
          archived: !!data.archived,
          primary_worker: data.primary_worker || null,
          location: data.location || null,
          team: data.team || null,
          asset: data.asset || null,
          assignedTo: data.assignedTo || [],
          customers: data.customers || []
        };
        setForm(nextForm);
        setPrimaryUser(nextForm.primary_worker ? { id: nextForm.primary_worker.id, label: nextForm.primary_worker.email || `${nextForm.primary_worker.name || ''} ${nextForm.primary_worker.email || ''}`.trim() || `#${nextForm.primary_worker.id}` } : null);
        setLocation(nextForm.location ? { id: nextForm.location.id, label: nextForm.location.name || `#${nextForm.location.id}` } : null);
        setTeam(nextForm.team ? { id: nextForm.team.id, label: nextForm.team.name || `#${nextForm.team.id}` } : null);
        setAsset(nextForm.asset ? { id: nextForm.asset.id, label: nextForm.asset.name || `#${nextForm.asset.id}` } : null);
        setAssignedTo((nextForm.assignedTo || []).map((u) => ({ id: u.id, label: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || `#${u.id}` })));
        setCustomers((nextForm.customers || []).map((c) => ({ id: c.id, label: c.name || `#${c.id}` })));
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, open]);

  const onChange = (patch: Partial<WorkOrder>) => setForm((prev) => ({ ...(prev || ({} as WorkOrder)), ...patch }));

  const submit = async () => {
    if (!form) return;
    setSubmitting(true);
    try {
      const payload: any = { title: form.title, priority: form.priority, description: form.description };
      payload.due_date = form.due_date || null;
      payload.estimated_start_date = form.estimated_start_date || null;
      payload.estimated_duration = form.estimated_duration != null ? Number(form.estimated_duration) : null;
      payload.requiredSignature = !!form.requiredSignature;
      payload.archived = !!form.archived;
      if (primaryUser?.id) payload.primary_worker = primaryUser.id; else payload.primaryUser = null;
      if (location?.id) payload.location = { id: location.id }; else payload.location = null;
      if (team?.id) payload.team = { id: team.id }; else payload.team = null;
      if (asset?.id) payload.asset = { id: asset.id }; else payload.asset = null;
      payload.assignedTo = assignedTo.map((u) => ({ id: u.id }));
      payload.customers = customers.map((c) => ({ id: c.id }));
      await api(`work-orders/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      onClose();
      onSaved?.();
    } catch (e) {
      alert('Failed to save work order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('edit_work_order') || 'Edit Work Order'}</DialogTitle>
      <DialogContent>
        {!form ? (
          <div style={{ padding: 16 }}>{t('loading')}</div>
        ) : (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label={t('title_col') || 'Title'} value={form.title} onChange={(e) => onChange({ title: e.target.value })} fullWidth required />
            <TextField label={t('priority_col') || 'Priority'} value={form.priority} onChange={(e) => onChange({ priority: e.target.value })} select fullWidth>
              {['NONE','LOW','MEDIUM','HIGH'].map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField label={t('due_col') || 'Due'} type="date" value={form.due_date || ''} onChange={(e) => onChange({ due_date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label={t('estimated_start_date') || 'Estimated Start'} type="date" value={(form.estimated_start_date as string) || ''} onChange={(e) => onChange({ estimated_start_date: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            <TextField label={t('estimated_duration') || 'Estimated Duration (h)'} type="number" inputProps={{ step: '0.25', min: '0' }} value={(form.estimated_duration as any) ?? ''} onChange={(e) => onChange({ estimated_duration: e.target.value ? Number(e.target.value) : null })} fullWidth />
            <FormControlLabel control={<Checkbox checked={!!form.requiredSignature} onChange={(e) => onChange({ requiredSignature: e.target.checked })} />} label={t('required_signature') || 'Required Signature'} />
            <FormControlLabel control={<Checkbox checked={!!form.archived} onChange={(e) => onChange({ archived: e.target.checked })} />} label={t('archived') || 'Archived'} />
            <TextField label={t('description') || 'Description'} value={form.description} onChange={(e) => onChange({ description: e.target.value })} fullWidth multiline minRows={3} />
            <RemoteSearchSelect
              label={t('primary_worker') || 'Primary User'}
              placeholder={t('search_users') || 'Search users...'}
              value={primaryUser}
              onChange={(v)=>{console.log(v); setPrimaryUser(v)}}
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
                return content.map((u: any) => ({ id: u.ID, label: u.Name || u.Email || `${u.Name || ''} ${u.Name || ''}`.trim() }));
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
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>{t('cancel') || 'Cancel'}</Button>
        <Button variant="contained" onClick={submit} disabled={submitting || !form || !form.title?.trim()}>{t('save') || 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
