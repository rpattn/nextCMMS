"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { IconButton, Link, List, ListItem, ListItemText, Stack, TextField, Typography, Button, Tooltip } from '@mui/material';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

type LinkItem = { id: number; relationType?: string; child?: { id: number; title?: string } };

export default function LinksList({ workOrderId }: { workOrderId: number }) {
  const [items, setItems] = useState<LinkItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const [relationType, setRelationType] = useState('RELATED');
  const [childId, setChildId] = useState('');
  useEffect(() => {
    let active = true;
    api<LinkItem[]>(`relations/work-order/${workOrderId}`)
      .then((data) => active && setItems(data))
      .catch(() => active && setError('Failed to load links'));
    return () => { active = false; };
  }, [workOrderId, version]);
  const add = async () => {
    const cid = Number(childId);
    if (!cid) return;
    try {
      await api(`relations`, { method: 'POST', body: JSON.stringify({ relationType, child: { id: cid }, parent: { id: workOrderId } }) });
      setChildId(''); setRelationType('RELATED'); setVersion((v) => v + 1);
    } catch { alert('Failed to add relation'); }
  };
  const remove = async (id: number) => {
    if (!confirm('Delete link?')) return;
    try { await api(`relations/${id}`, { method: 'DELETE' }); setVersion((v) => v + 1); } catch { alert('Failed to delete relation'); }
  };
  if (error) return <Typography color="error" variant="body2">{error}</Typography>;
  if (!items) return <Typography variant="body2">Loading...</Typography>;
  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField size="small" label="Relation type" value={relationType} onChange={(e) => setRelationType(e.target.value)} sx={{ minWidth: 160 }} />
        <TextField size="small" type="number" label="Child Work Order ID" value={childId} onChange={(e) => setChildId(e.target.value)} />
        <Button onClick={add} variant="contained">Add</Button>
      </Stack>
      {items.length === 0 ? (
        <Typography variant="body2">No links</Typography>
      ) : (
        <List dense>
          {items.map((l) => (
            <ListItem key={l.id} disableGutters secondaryAction={
              <Tooltip title="Delete">
                <IconButton edge="end" onClick={() => remove(l.id)} aria-label="delete"><DeleteTwoToneIcon fontSize="small" /></IconButton>
              </Tooltip>
            }>
              <ListItemText primary={`${l.relationType || ''} → #${l.child?.id || ''}`} secondary={l.child?.title} />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
