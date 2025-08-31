"use client";

import ThemeSwitcher from '@/components/common/ThemeSwitcher';
import Preferences from '@/components/settings/Preferences';
import { useI18n } from '@/components/providers/I18nProvider';
import React from 'react';

export default function SettingsPage() {
  const { t } = useI18n();
  return (
    <section>
      <h1 style={{ marginBottom: 16 }}>{t('settings')}</h1>
      <div style={{ display: 'grid', gap: 32, alignItems: 'start' }}>
        <section>
          <h2 style={{ margin: '8px 0' }}>{t('appearance')}</h2>
          <p style={{ margin: '4px 0 12px', opacity: 0.8 }}>Choose mode, theme, and direction</p>
          <ThemeSwitcher />
        </section>
        <section>
          <h2 style={{ margin: '8px 0' }}>{t('preferences')}</h2>
          <p style={{ margin: '4px 0 12px', opacity: 0.8 }}>Language, date format, and density</p>
          <Preferences />
        </section>
      </div>
    </section>
  );
}