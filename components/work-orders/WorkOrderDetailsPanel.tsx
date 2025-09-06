"use client";

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { Box, Chip, Divider, IconButton, Stack, Typography, Button, Tab, Tabs, Grid } from '@mui/material';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import EditWorkOrderModal from '@/components/work-orders/EditWorkOrderModal';
import TasksList from '@/components/work-orders/details/TasksList';
import FilesList from '@/components/work-orders/details/FilesList';
import LinksList from '@/components/work-orders/details/LinksList';
import TimeCostList from '@/components/work-orders/details/TimeCostList';
import CloseIcon from '@mui/icons-material/Close';
import { useI18n } from '@/components/providers/I18nProvider';

type WorkOrder = {
  id: string;
  custom_id?: string;
  title?: string;
  description?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' | string;
  status?: string;
  due_date?: string;
  estimated_start_date?: string | null;
  estimated_duration?: number | null;
  requiredSignature?: boolean;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
  completedOn?: string | null;
  createdBy?: number;
  updatedBy?: number;
  completedBy?: number | null;
  category?: { name?: string } | null;
  location?: { name?: string } | null;
  team?: { name?: string } | null;
  asset?: { name?: string } | null;
  assigned_to?: Array<{ id: number; firstName?: string; lastName?: string; name?: string }>;
  customers?: Array<{ id: number; name?: string }>;
};

export default function WorkOrderDetailsPanel({ id, onClose, onChanged }: { id: string; onClose?: () => void; onChanged?: () => void }) {
  const { t } = useI18n();
  const [wo, setWo] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<'overview' | 'tasks' | 'files' | 'links' | 'entries'>('overview');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api<WorkOrder>(`work-orders/${id}`)
      .then((data) => {
        if (!active) return;
        setWo(data);
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.message || 'Failed to load');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  const due = useMemo(() => (wo?.due_date ? new Date(wo.due_date) : null), [wo?.due_date]);
  const overdue = useMemo(() => (due ? due.getTime() < Date.now() : false), [due]);
  const priorityColor = wo?.priority === 'HIGH' ? 'error' : wo?.priority === 'MEDIUM' ? 'warning' : wo?.priority === 'LOW' ? 'success' : 'default';
  const fmtDate = (v?: string | null, withTime = false) => {
    if (!v) return '';
    try {
      const d = new Date(v);
      return withTime ? d.toLocaleString() : d.toLocaleDateString();
    } catch {
      return String(v);
    }
  };
  const boolText = (b?: boolean) => (b ? (t('yes') || 'Yes') : (t('no') || 'No'));

  return (
    <Box sx={{ p: 2, width: 420, maxWidth: '100vw' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">{wo ? `${wo.custom_id ? `#${wo.custom_id}` : `#${wo.id}`} ${wo.title || ''}` : t('loading')}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {wo && (
            <Button size="small" startIcon={<EditTwoToneIcon />} onClick={() => setEditOpen(true)}>
              {t('edit_work_order') || 'Edit'}
            </Button>
          )}
          <IconButton onClick={onClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      {loading && <Typography variant="body2">{t('loading')}</Typography>}
      {error && <Typography color="error" variant="body2">{error}</Typography>}
      {!!wo && (
        <>
          <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ mb: 1 }}>
            <Tab label="Overview" value="overview" />
            <Tab label="Tasks" value="tasks" />
            <Tab label="Files" value="files" />
            <Tab label="Links" value="links" />
            <Tab label="Time & Cost" value="entries" />
          </Tabs>
          {tab === 'overview' && (
            <>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Chip label={wo.priority || 'NONE'} color={priorityColor as any} size="small" />
                {wo.status && <Chip label={wo.status} size="small" />}
                {due && (
                  <Chip label={`${t('due_col')}: ${due.toLocaleDateString()}`} size="small" color={overdue ? 'error' : 'default'} variant={overdue ? 'filled' : 'outlined'} />
                )}
              </Stack>
              <Divider sx={{ my: 1 }} />
              {/* Key info grid */}
              <Grid container spacing={1} sx={{ mb: 1 }}>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('id_col') || 'ID'}</Typography><Typography variant="body2">{wo.custom_id || wo.id}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('status') || 'Status'}</Typography><Typography variant="body2">{wo.status || ''}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('due_col') || 'Due Date'}</Typography><Typography variant="body2">{fmtDate(wo.due_date)}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('created_at') || 'Created At'}</Typography><Typography variant="body2">{fmtDate(wo.created_at, true)}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('updated_at') || 'Updated At'}</Typography><Typography variant="body2">{fmtDate(wo.updated_at, true)}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('estimated_start_date') || 'Estimated Start'}</Typography><Typography variant="body2">{fmtDate(wo.estimated_start_date || undefined)}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('estimated_duration') || 'Estimated Duration (h)'}</Typography><Typography variant="body2">{wo.estimated_duration ?? ''}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('required_signature') || 'Required Signature'}</Typography><Typography variant="body2">{boolText(wo.requiredSignature)}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('archived') || 'Archived'}</Typography><Typography variant="body2">{boolText(wo.archived)}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('category') || 'Category'}</Typography><Typography variant="body2">{wo.category?.name || ''}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('location') || 'Location'}</Typography><Typography variant="body2">{wo.location?.name || ''}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('team') || 'Team'}</Typography><Typography variant="body2">{wo.team?.name || ''}</Typography></Grid>
                <Grid size={{xs:12, sm:6}}><Typography variant="caption" color="text.secondary">{t('asset') || 'Asset'}</Typography><Typography variant="body2">{wo.asset?.name || ''}</Typography></Grid>
                {!!(wo.assigned_to && wo.assigned_to.length) && (
                  <Grid size={{xs:12}}>
                    <Typography variant="caption" color="text.secondary">{t('assigned_to') || 'Assigned To'}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      {wo.assigned_to!.map((u) => (
                        <Chip key={u.id} size="small" label={u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || `#${u.id}`} />
                      ))}
                    </Stack>
                  </Grid>
                )}
                {!!(wo.customers && wo.customers.length) && (
                  <Grid size={{xs:12}}>
                    <Typography variant="caption" color="text.secondary">{t('customers') || 'Customers'}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                      {wo.customers!.map((c) => (
                        <Chip key={c.id} size="small" label={c.name || `#${c.id}`} />
                      ))}
                    </Stack>
                  </Grid>
                )}
              </Grid>
              {wo.description && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>{t('description') || 'Description'}</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{wo.description}</Typography>
                </>
              )}
            </>
          )}
          {tab === 'tasks' && <TasksList workOrderId={wo.id} onChanged={onChanged} />}
          {tab === 'files' && <FilesList workOrderId={wo.id} />}
          {tab === 'links' && <LinksList workOrderId={wo.id} />}
          {tab === 'entries' && <TimeCostList workOrderId={wo.id} />}
        </>
      )}

      {/* Edit modal */}
      {wo && (
        <EditWorkOrderModal
          id={wo.id}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </Box>
  );
}
