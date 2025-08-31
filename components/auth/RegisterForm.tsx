"use client";

import { useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Checkbox, CircularProgress, FormControlLabel, FormHelperText, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
// Avoid Grid for wider compatibility; use simple flex layout
import VisibilityIcon from '@mui/icons-material/Visibility';
import countries from '@/lib/countries';

type Country = { code: string; label: string; phone: string };

export default function RegisterForm({ presetEmail, subscriptionPlanId }: { presetEmail?: string; subscriptionPlanId?: string }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(presetEmail || '');
  const [country, setCountry] = useState<Country | null>(null);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [employeesCount, setEmployeesCount] = useState<number>(5);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});

  const validations = useMemo(() => {
    const errs: { [k: string]: string | undefined } = {};
    if (!firstName) errs.firstName = 'First name is required';
    if (!lastName) errs.lastName = 'Last name is required';
    if (!email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Minimum 8 characters';
    if (!companyName) errs.companyName = 'Company is required';
    if (employeesCount === undefined || employeesCount === null) errs.employeesCount = 'Employees count is required';
    if (!country) errs.country = 'Country is required';
    if (!terms) errs.terms = 'You must accept the terms';
    return errs;
  }, [firstName, lastName, email, password, companyName, employeesCount, country, terms]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // basic client-side validation to mirror frontend UX
    if (
      validations.firstName ||
      validations.lastName ||
      validations.email ||
      validations.password ||
      validations.companyName ||
      validations.employeesCount ||
      validations.country ||
      validations.terms
    ) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        companyName: true,
        employeesCount: true,
        country: true,
        terms: true
      });
      setError('Please fix the highlighted fields');
      return;
    }
    setLoading(true);
    const payload: any = {
      email,
      firstName,
      lastName,
      companyName,
      employeesCount,
      password,
      terms: true,
      language: (typeof navigator !== 'undefined' ? navigator.language : 'en').toUpperCase(),
      subscriptionPlanId,
      phone: (country ? `+${country.phone}` : '') + phone
    };
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data?.message || data?.error || 'Registration failed');
      return;
    }
    const msg: string | undefined = data?.message;
    if (typeof msg === 'string' && msg.startsWith('Successful')) {
      setSuccess('Please check your email to verify your account.');
    } else {
      // Cookie is set by API route; user is logged in already. We can show success.
      setSuccess('Account created. Redirecting...');
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.href = '/app/work-orders';
      }, 800);
    }
  };

  return (
    <form noValidate onSubmit={onSubmit}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1 }}>
        <TextField
          fullWidth
          margin="normal"
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
          error={Boolean(touched.firstName && validations.firstName)}
          helperText={touched.firstName && validations.firstName}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
          error={Boolean(touched.lastName && validations.lastName)}
          helperText={touched.lastName && validations.lastName}
        />
      </Box>
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        disabled={!!presetEmail}
        error={Boolean(touched.email && validations.email)}
        helperText={touched.email && validations.email}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Autocomplete
          sx={{ width: 275 }}
          options={countries as any}
          autoHighlight
          value={country}
          onChange={(_e, v) => setCountry(v)}
          getOptionLabel={(o: any) => o?.label || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country"
              error={Boolean(touched.country && validations.country)}
              helperText={touched.country && validations.country}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password'
              }}
              onBlur={() => setTouched((t) => ({ ...t, country: true }))}
            />
          )}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </Box>
      <TextField
        fullWidth
        margin="normal"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setTouched((t) => ({ ...t, password: true }))}
        error={Boolean(touched.password && validations.password)}
        helperText={touched.password && validations.password}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((s) => !s)}>
                <VisibilityIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1 }}>
        <TextField
          fullWidth
          margin="normal"
          label="Company"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, companyName: true }))}
          error={Boolean(touched.companyName && validations.companyName)}
          helperText={touched.companyName && validations.companyName}
        />
        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Employees count"
          value={employeesCount}
          onChange={(e) => setEmployeesCount(parseInt(e.target.value || '0', 10))}
          onBlur={() => setTouched((t) => ({ ...t, employeesCount: true }))}
          error={Boolean(touched.employeesCount && validations.employeesCount)}
          helperText={touched.employeesCount && validations.employeesCount}
        />
      </Box>
      <FormControlLabel
        control={<Checkbox checked={terms} onChange={(e) => setTerms(e.target.checked)} />}
        label={<Typography variant="body2">I accept the Terms and Conditions.</Typography>}
      />
      {Boolean(touched.terms && validations.terms) && (
        <FormHelperText error sx={{ mt: -1, mb: 1 }}>{validations.terms}</FormHelperText>
      )}
      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
      <Button sx={{ mt: 3 }} variant="contained" fullWidth size="large" type="submit" disabled={loading}>
        Create your account
      </Button>
      {success && (
        <Typography color="success.main" variant="body2" sx={{ mt: 2 }}>
          {success}
        </Typography>
      )}
    </form>
  );
}
