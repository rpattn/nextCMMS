"use client";

import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type SupportedLang = 'en' | 'fr' | 'es';

type Dict = Record<string, string>;
type Dictionaries = Record<SupportedLang, Dict>;

const dictionaries: Dictionaries = {
  en: {
    work_orders: 'Work Orders',
    settings: 'Settings',
    appearance: 'Appearance',
    preferences: 'Preferences',
    language: 'Language',
    date_format: 'Date format',
    density_compact: 'Compact density',
    list_view: 'List',
    calendar_view: 'Calendar',
    filters: 'Filters',
    status: 'Status',
    hide_archived: 'Hide archived',
    export: 'Export',
    add_work_order: 'Add Work Order',
    cancel: 'Cancel',
    description: 'Description',
    edit_work_order: 'Edit Work Order',
    save: 'Save',
    search: 'Search',
    search_title_placeholder: 'Search title...',
    id_col: 'ID',
    title_col: 'Title',
    priority_col: 'Priority',
    due_col: 'Due',
    loading: 'Loading...',
    my_account: 'My Account',
    switching: 'Switching...',
    switch_to_super_user: 'Switch to Super User',
    documentation: 'Documentation',
    sign_out: 'Sign out'
  },
  fr: {
    work_orders: 'Ordres de travail',
    settings: 'Paramètres',
    appearance: 'Apparence',
    preferences: 'Préférences',
    language: 'Langue',
    date_format: 'Format de date',
    density_compact: 'Densité compacte',
    list_view: 'Liste',
    calendar_view: 'Calendrier',
    filters: 'Filtres',
    status: 'Statut',
    hide_archived: 'Masquer archives',
    export: 'Exporter',
    add_work_order: 'Ajouter un OT',
    cancel: 'Annuler',
    description: 'Description',
    edit_work_order: 'Modifier OT',
    save: 'Enregistrer',
    search: 'Rechercher',
    search_title_placeholder: 'Rechercher un titre...',
    id_col: 'ID',
    title_col: 'Titre',
    priority_col: 'Priorité',
    due_col: 'Échéance',
    loading: 'Chargement...',
    my_account: 'Mon compte',
    switching: 'Changement...',
    switch_to_super_user: 'Basculer vers Super Utilisateur',
    documentation: 'Documentation',
    sign_out: 'Déconnexion'
  },
  es: {
    work_orders: 'Órdenes de trabajo',
    settings: 'Configuración',
    appearance: 'Apariencia',
    preferences: 'Preferencias',
    language: 'Idioma',
    date_format: 'Formato de fecha',
    density_compact: 'Densidad compacta',
    list_view: 'Lista',
    calendar_view: 'Calendario',
    filters: 'Filtros',
    status: 'Estado',
    hide_archived: 'Ocultar archivados',
    export: 'Exportar',
    add_work_order: 'Añadir orden',
    cancel: 'Cancelar',
    description: 'Descripción',
    edit_work_order: 'Editar orden',
    save: 'Guardar',
    search: 'Buscar',
    search_title_placeholder: 'Buscar título...',
    id_col: 'ID',
    title_col: 'Título',
    priority_col: 'Prioridad',
    due_col: 'Vencimiento',
    loading: 'Cargando...',
    my_account: 'Mi cuenta',
    switching: 'Cambiando...',
    switch_to_super_user: 'Cambiar a Super Usuario',
    documentation: 'Documentación',
    sign_out: 'Cerrar sesión'
  }
};

type I18nContextValue = {
  lang: SupportedLang;
  setLang: (l: SupportedLang) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (k) => k
});

export function I18nProvider({ children, initialLang }: PropsWithChildren<{ initialLang?: SupportedLang }>) {
  const [lang, setLangState] = useState<SupportedLang>(initialLang || 'en');

  useEffect(() => {
    try {
      // Prefer cookie if present (kept in sync by Preferences)
      const m = document.cookie.match(/(?:^|; )appLang=([^;]+)/);
      const fromCookie = m ? decodeURIComponent(m[1]) : null;
      if (fromCookie && ['en', 'fr', 'es'].includes(fromCookie)) {
        setLangState(fromCookie as SupportedLang);
      } else if (!initialLang) {
        const stored = localStorage.getItem('appLang');
        if (stored && ['en', 'fr', 'es'].includes(stored)) setLangState(stored as SupportedLang);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((l: SupportedLang) => {
    setLangState(l);
    try {
      localStorage.setItem('appLang', l);
      document.cookie = `appLang=${encodeURIComponent(l)}; path=/; max-age=31536000; samesite=lax`;
    } catch {}
  }, []);

  const t = useCallback((key: string) => {
    const dict = dictionaries[lang] || dictionaries.en;
    return dict[key] || key;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
