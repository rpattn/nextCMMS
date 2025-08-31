"use client";

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

export default function ThemeInitScript() {
  // Render the MUI no-flash color-scheme init script on the client
  // Align with CssVarsProvider defaultMode (system) and 'data' selector
  return <InitColorSchemeScript defaultMode="system" attribute="data" />;
}
