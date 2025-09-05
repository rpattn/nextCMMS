"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button, IconButton, List, ListItem, ListItemText, MenuItem, Stack, TextField, Typography, Tooltip, Divider } from '@mui/material';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

type Entry = { id: number; type?: 'TIME' | 'COST' | string; hours?: number; amount?: number; note?: string; date?: string };

export default function TimeCostList({ workOrderId }: { workOrderId: string }) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [type, setType] = useState<'TIME' | 'COST'>('TIME');
  const [hours, setHours] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');
  useEffect(() => {
    let active = true;
    Promise.all([
      api<any[]>(`labors/work-order/${workOrderId}`),
      api<any[]>(`additional-costs/work-order/${workOrderId}`)
    ])
      .then(([labors, costs]) => {
        if (!active) return;
        const combined: Entry[] = [
          ...(labors || []).map((l: any) => ({ id: l.id, type: 'TIME', hours: l.hours, note: l.note, date: l.date })),
          ...(costs || []).map((c: any) => ({ id: c.id, type: 'COST', amount: c.amount, note: c.note, date: c.date }))
        ];
        setEntries(combined);
      })
      .catch(() => active && setError('Failed to load entries'));
    return () => { active = false; };
  }, [workOrderId, version]);
  const add = async () => {
    const body: any = { type, note: note || undefined, date: date || undefined };
    if (type === 'TIME') body.hours = hours ? Number(hours) : undefined;
    else body.amount = amount ? Number(amount) : undefined;
    try {
      if (type === 'TIME') await api(`labors`, { method: 'POST', body: JSON.stringify({ ...body, workOrder: { id: workOrderId } }) });
      else await api(`additional-costs`, { method: 'POST', body: JSON.stringify({ ...body, workOrder: { id: workOrderId } }) });
      setHours(''); setAmount(''); setNote(''); setDate('');
      setVersion((v) => v + 1);
    } catch { alert('Failed to add entry'); }
  };
  const remove = async (id: number) => {
    if (!confirm('Delete entry?')) return;
    try {
      const found = (entries || []).find((e) => e.id === id);
      if (found?.type === 'TIME') await api(`labors/${id}`, { method: 'DELETE' });
      else await api(`additional-costs/${id}`, { method: 'DELETE' });
      setVersion((v) => v + 1);
    } catch { alert('Failed to delete entry'); }
  };
  if (error) return <Typography color="error" variant="body2">{error}</Typography>;
  if (!entries) return <Typography variant="body2">Loading...</Typography>;
  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
        <TextField select size="small" label="Type" value={type} onChange={(e) => setType(e.target.value as any)} sx={{ minWidth: 120 }}>
          <MenuItem value="TIME">Time</MenuItem>
          <MenuItem value="COST">Cost</MenuItem>
        </TextField>
        {type === 'TIME' ? (
          <TextField size="small" type="number" inputProps={{ step: '0.25', min: '0' }} label="Hours" value={hours} onChange={(e) => setHours(e.target.value)} />
        ) : (
          <TextField size="small" type="number" inputProps={{ step: '0.01', min: '0' }} label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        )}
        <TextField size="small" label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth />
        <TextField size="small" type="date" label="Date" InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />
        <Button variant="contained" onClick={add}>Add</Button>
      </Stack>
      {entries.length === 0 ? (
        <Typography variant="body2">No time/cost entries</Typography>
      ) : (
        <List dense>
          {entries.map((e) => (
            <ListItem key={e.id} disableGutters secondaryAction={
              <Tooltip title="Delete">
                <IconButton edge="end" onClick={() => remove(e.id)} aria-label="delete"><DeleteTwoToneIcon fontSize="small" /></IconButton>
              </Tooltip>
            }>
              <ListItemText
                primary={`${e.type || ''} ${e.hours != null ? `${e.hours}h` : e.amount != null ? `$${e.amount}` : ''}`.trim()}
                secondary={e.date ? new Date(e.date).toLocaleString() : e.note}
              />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
