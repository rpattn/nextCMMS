"use client";

import Link from 'next/link';
import { AppBar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { brand } from '@/lib/brand';

export default function MarketingHeader() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography variant="h6" color="inherit">{brand.name}</Typography>
            </Link>
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <Button component={Link as any} href="/pricing" color="inherit">Pricing</Button>
            <Button component={Link as any} href="/account/login" color="inherit">Login</Button>
            <Button component={Link as any} href="/account/register" variant="contained">Register</Button>
          </Box>
          <Box sx={{ display: { xs: 'inline-flex', sm: 'none' } }}>
            <IconButton aria-label="open menu" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => setAnchorEl(null)} component={Link as any} href="/pricing">Pricing</MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)} component={Link as any} href="/account/login">Login</MenuItem>
              <MenuItem onClick={() => setAnchorEl(null)} component={Link as any} href="/account/register">Register</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

