"use client";

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { IconButton, Link, List, ListItem, ListItemText, Stack, Typography, Button, Tooltip } from '@mui/material';
import UploadTwoToneIcon from '@mui/icons-material/UploadTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

type FileItem = { id: number; name?: string; url?: string };

export default function FilesList({ workOrderId }: { workOrderId: number }) {
  const [files, setFiles] = useState<FileItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    let active = true;
    api<any>(`work-orders/${workOrderId}`)
      .then((wo) => active && setFiles((wo?.files as FileItem[]) || []))
      .catch(() => active && setError('Failed to load files'));
    return () => { active = false; };
  }, [workOrderId, version]);
  const upload = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const fd = new FormData();
    Array.from(filesList).forEach((f) => fd.append('files', f));
    try {
      const uploaded = await api<any[]>(`files/upload`, { method: 'POST', body: fd });
      const ids = (uploaded || []).map((f) => ({ id: f.id }));
      if (ids.length) await api(`work-orders/files/${workOrderId}/add`, { method: 'PATCH', body: JSON.stringify(ids) });
      setVersion((v) => v + 1);
    } catch {
      alert('Upload failed');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  const remove = async (id: number) => {
    if (!confirm('Delete file?')) return;
    try {
      await api(`work-orders/files/${workOrderId}/${id}/remove`, { method: 'DELETE' });
      setVersion((v) => v + 1);
    } catch { alert('Failed to delete file'); }
  };
  if (error) return <Typography color="error" variant="body2">{error}</Typography>;
  if (!files) return <Typography variant="body2">Loading...</Typography>;
  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <input ref={inputRef} id={`wo-upload-${workOrderId}`} type="file" multiple style={{ display: 'none' }} onChange={(e) => upload(e.target.files)} />
        <label htmlFor={`wo-upload-${workOrderId}`}>
          <Button startIcon={<UploadTwoToneIcon />} variant="outlined" component="span">Upload</Button>
        </label>
      </Stack>
      {files.length === 0 ? (
        <Typography variant="body2">No files</Typography>
      ) : (
        <List dense>
          {files.map((f) => (
            <ListItem key={f.id} disableGutters secondaryAction={
              <Tooltip title="Delete">
                <IconButton edge="end" onClick={() => remove(f.id)} aria-label="delete"><DeleteTwoToneIcon fontSize="small" /></IconButton>
              </Tooltip>
            }>
              <ListItemText primary={f.name || `File #${f.id}`} secondary={f.url ? <Link href={f.url} target="_blank" rel="noreferrer">{f.url}</Link> : undefined} />
            </ListItem>
          ))}
        </List>
      )}
    </>
  );
}
