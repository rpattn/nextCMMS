"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Box, Checkbox, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Stack, TextField, Typography, Button, Tooltip, Chip } from '@mui/material';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import RemoteSearchSelect, { RemoteOption } from '@/components/common/RemoteSearchSelect';

type Task = {
  id: number;
  title?: string;
  completed?: boolean;
  assigneeName?: string;
  taskBase?: any;
};

export default function TasksList({ workOrderId, onChanged }: { workOrderId: number; onChanged?: () => void }) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [assignee, setAssignee] = useState<RemoteOption | null>(null);
  const [asset, setAsset] = useState<RemoteOption | null>(null);
  const [meter, setMeter] = useState<RemoteOption | null>(null);
  const [optionsCsv, setOptionsCsv] = useState<string>('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    api<Task[]>(`tasks/work-order/${workOrderId}`)
      .then((data) => active && setTasks(data))
      .catch(() => active && setError('Failed to load tasks'));
    return () => { active = false; };
  }, [workOrderId, version]);
  const addTask = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      // Load existing tasks to collect their taskBase definitions and convert to DTOs
      const existing = await api<any[]>(`tasks/work-order/${workOrderId}`);
      const toDto = (tb: any) => {
        const dto: any = { label: tb?.label ?? tb?.name ?? '' };
        // Options: normalize to array of labels if present
        if (Array.isArray(tb?.options)) dto.options = tb.options.map((o: any) => (o?.label ?? String(o))).filter(Boolean);
        else if (typeof tb?.options === 'string') dto.options = tb.options.split(',').map((s: string) => s.trim()).filter(Boolean);
        if (tb?.user?.id) dto.user = { id: Number(tb.user.id) };
        if (tb?.asset?.id) dto.asset = { id: Number(tb.asset.id) };
        if (tb?.meter?.id) dto.meter = { id: Number(tb.meter.id) };
        return dto;
      };
      const taskBases = (existing || []).map((t) => toDto(t.taskBase));
      const newDto: any = { label: title };
      if (assignee?.id) newDto.user = { id: assignee.id };
      if (asset?.id) newDto.asset = { id: asset.id };
      if (meter?.id) newDto.meter = { id: meter.id };
      const opts = optionsCsv.split(',').map((s) => s.trim()).filter(Boolean);
      if (opts.length) newDto.options = opts;
      taskBases.push(newDto);
      await api(`tasks/work-order/${workOrderId}`, { method: 'PATCH', body: JSON.stringify(taskBases) });
      setNewTitle('');
      setAssignee(null);
      setAsset(null);
      setMeter(null);
      setOptionsCsv('');
      setVersion((v) => v + 1);
      onChanged?.();
    } catch {
      alert('Failed to add task');
    }
  };
  const toggle = async (task: Task, checked: boolean) => {
    try {
      await api(`tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ value: String(checked) }) });
      setVersion((v) => v + 1);
      onChanged?.();
    } catch {
      alert('Failed to update task');
    }
  };
  const remove = async (task: Task) => {
    if (!confirm('Delete task?')) return;
    try {
      await api(`tasks/${task.id}`, { method: 'DELETE' });
      setVersion((v) => v + 1);
      onChanged?.();
    } catch {
      alert('Failed to delete task');
    }
  };
  if (error) return <Typography color="error" variant="body2">{error}</Typography>;
  if (!tasks) return <Typography variant="body2">Loading...</Typography>;
  return (
    <Box>
      <Stack direction="column" spacing={1} sx={{ mb: 1 }}>
        <TextField size="small" fullWidth label="Task label" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <RemoteSearchSelect
            label="Assignee"
            placeholder="Search users..."
            value={assignee}
            onChange={setAssignee}
            search={async (q) => {
              // Search users by email or name
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
            label="Asset"
            placeholder="Search assets..."
            value={asset}
            onChange={setAsset}
            search={async (q) => {
              const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
              const res: any = await api('assets/search', { method: 'POST', body: JSON.stringify(criteria) });
              const content = res?.content || [];
              return content.map((a: any) => ({ id: a.id, label: a.name || `#${a.id}` }));
            }}
          />
          <RemoteSearchSelect
            label="Meter"
            placeholder="Search meters..."
            value={meter}
            onChange={setMeter}
            search={async (q) => {
              const criteria = { pageNum: 0, pageSize: 10, filterFields: q ? [{ field: 'name', operation: 'cn', value: q }] : [] };
              const res: any = await api('meters/search', { method: 'POST', body: JSON.stringify(criteria) });
              const content = res?.content || [];
              return content.map((m: any) => ({ id: m.id, label: m.name || `#${m.id}` }));
            }}
          />
        </Stack>
        {(assignee || asset || meter) && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {assignee && (
              <Chip size="small" color="primary" label={`Assignee: ${assignee.label}`} onDelete={() => setAssignee(null)} />
            )}
            {asset && (
              <Chip size="small" color="secondary" label={`Asset: ${asset.label}`} onDelete={() => setAsset(null)} />
            )}
            {meter && (
              <Chip size="small" label={`Meter: ${meter.label}`} onDelete={() => setMeter(null)} />
            )}
          </Stack>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField size="small" fullWidth label="Options (comma-separated)" value={optionsCsv} onChange={(e) => setOptionsCsv(e.target.value)} />
          <Button variant="contained" onClick={addTask}>Add</Button>
        </Stack>
      </Stack>
      {tasks.length === 0 ? (
        <Typography variant="body2">No tasks</Typography>
      ) : (
        <List dense>
          {tasks.map((t) => (
            <ListItem key={t.id} disableGutters secondaryAction={
              <Tooltip title="Delete">
                <IconButton edge="end" onClick={() => remove(t)} aria-label="delete"><DeleteTwoToneIcon fontSize="small" /></IconButton>
              </Tooltip>
            }>
              <Checkbox edge="start" checked={!!t.completed} onChange={(e) => toggle(t, e.target.checked)} sx={{ mr: 1 }} />
              <ListItemText primary={t.title || `Task #${t.id}`} secondary={t.assigneeName ? `@${t.assigneeName}` : undefined} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
