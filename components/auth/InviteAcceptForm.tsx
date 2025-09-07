"use client";

import { useActionState, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';

type AcceptState =
  | { ok: false; error: string }
  | { ok: true; needs_password?: boolean; redirect?: string };

function AcceptButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="contained" size="large" disabled={pending} startIcon={pending ? <CircularProgress size="1rem" /> : null}>
      Accept Invite
    </Button>
  );
}

function SetPasswordButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="contained" size="large" disabled={pending} startIcon={pending ? <CircularProgress size="1rem" /> : null}>
      Set Password
    </Button>
  );
}

export default function InviteAcceptForm({
  token,
  acceptAction,
  setPasswordAction,
}: {
  token: string;
  acceptAction: (state: AcceptState | undefined, formData: FormData) => Promise<AcceptState>;
  setPasswordAction: (state: AcceptState | undefined, formData: FormData) => Promise<AcceptState> | any;
}) {
  const [acceptState, acceptFormAction] = useActionState(acceptAction, undefined as any);
  const [setPwdState, setPwdFormAction] = useActionState(setPasswordAction, undefined as any);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const needsPassword = useMemo(() => {
    return Boolean(acceptState?.ok && acceptState.needs_password) || Boolean(setPwdState?.ok && setPwdState.needs_password);
  }, [acceptState, setPwdState]);

  const acceptError = acceptState && !acceptState.ok ? acceptState.error : null;
  const setPwdError = setPwdState && !setPwdState.ok ? setPwdState.error : null;

  // If server actions return a redirect URL, navigate client-side to avoid NEXT_REDIRECT dev errors
  useEffect(() => {
    const url = (setPwdState as any)?.redirect || (acceptState as any)?.redirect;
    if (typeof url === 'string' && url) {
      router.replace(url);
    }
  }, [acceptState, setPwdState, router]);

  return (
    <main>
      <Typography variant="h4" gutterBottom>
        Accept Invite
      </Typography>
      {!token && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Missing invite token.
        </Alert>
      )}

      {!needsPassword && (
        <form action={acceptFormAction}>
          <input type="hidden" name="token" value={token} />
          {acceptError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {acceptError}
            </Alert>
          )}
          <Box>
            <AcceptButton />
          </Box>
        </form>
      )}

      {needsPassword && (
        <form action={setPwdFormAction}>
          {setPwdError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {setPwdError}
            </Alert>
          )}
          <Box sx={{ maxWidth: 420 }}>
            <Typography sx={{ mb: 1 }}>Set a password to activate your account</Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              label="Password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((s) => !s)}>
                      <VisibilityIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 2 }}>
              <SetPasswordButton />
            </Box>
          </Box>
        </form>
      )}
    </main>
  );
}
