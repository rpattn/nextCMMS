"use client";

import { useCallback, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

type InviteState =
  | { ok: false; error: string }
  | { ok: true; accept_url?: string; needs_password?: boolean };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="contained"
      size="large"
      fullWidth
      disabled={pending}
      startIcon={pending ? <CircularProgress size="1rem" /> : null}
    >
      Invite
    </Button>
  );
}

export default function InviteForm({
  action,
}: {
  action: (state: InviteState | undefined, formData: FormData) => Promise<InviteState>;
}) {
  const [state, formAction] = useFormState(action, undefined as any);
  const [role, setRole] = useState('Viewer');

  const copy = useCallback(async () => {
    if (state && state.ok && state.accept_url) {
      try {
        await navigator.clipboard.writeText(state.accept_url);
      } catch {}
    }
  }, [state]);

  return (
    <form action={formAction} noValidate>
      <Box sx={{ maxWidth: 480 }}>
        <TextField
          fullWidth
          margin="normal"
          autoFocus
          label="Invitee Email"
          name="email"
          type="email"
          required
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="invite-role-label">Role</InputLabel>
          <Select
            labelId="invite-role-label"
            label="Role"
            name="role"
            value={role}
            onChange={(e) => setRole(String(e.target.value))}
          >
            <MenuItem value="Viewer">Viewer</MenuItem>
            <MenuItem value="Member">Member</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Owner">Owner</MenuItem>
          </Select>
        </FormControl>

        {state && !state.ok && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {state.error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <SubmitButton />
        </Box>

        {state && state.ok && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              {state.accept_url ? 'Invite link created' : 'Invite created'}
            </Typography>
            {state.needs_password && (
              <Typography sx={{ mb: state.accept_url ? 1 : 0 }}>
                The user will set their password when accepting the invite.
              </Typography>
            )}
            {state.accept_url && (
              <TextField
                fullWidth
                value={state.accept_url}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <Button size="small" onClick={copy} startIcon={<ContentCopyIcon fontSize="small" />}>Copy</Button>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          </Alert>
        )}
      </Box>
    </form>
  );
}
