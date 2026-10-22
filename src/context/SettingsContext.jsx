import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { STRINGS } from '../i18n';
import { colors as tk } from '../theme/tokens';
import { loadJSON, saveJSON } from '../utils/storage';
import { useProfile } from './ProfileContext';

const SettingsContext = createContext(/** @type {any} */ (null));

// The app is dark-only; these keys are what the screens read.
const COLORS = {
  bg: tk.bg,
  card: tk.surface,
  text: tk.text,
  sub: tk.sub,
  border: tk.line,
  input: tk.surfaceHi,
  placeholder: tk.faint,
  accent: tk.lime,
  danger: tk.danger,
  chip: tk.surfaceHi,
  overlay: 'rgba(0,0,0,0.72)',
};

const KEY = 'ticketmobile.settings';

export function SettingsProvider({ children }) {
  const { profile, updateProfile } = useProfile();
  const [lang, setLang] = useState(() => loadJSON(KEY).lang ?? 'th');
  const [notifications, setNotifications] = useState(() => loadJSON(KEY).notifications ?? true);
  const [autoDelete, setAutoDelete] = useState(() => loadJSON(KEY).autoDelete ?? false);

  useEffect(() => {
    saveJSON(KEY, { lang, notifications, autoDelete });
  }, [lang, notifications, autoDelete]);

  // Once the profile row loads, its saved settings win over the local cache.
  const [syncedId, setSyncedId] = useState(null);
  if (profile && profile.id !== syncedId) {
    setSyncedId(profile.id);
    setLang(profile.lang ?? 'th');
    setNotifications(profile.notifications ?? true);
    setAutoDelete(profile.auto_delete ?? false);
  }

  // Setters that also persist to the signed-in user's profile.
  const persist = useCallback(
    (set, column) => (v) => {
      set(v);
      updateProfile({ [column]: v }).catch(() => {});
    },
    [updateProfile]
  );

  const t = useCallback(
    (key, vars) => {
      let s = STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
      if (vars) for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, String(vars[k]));
      return s;
    },
    [lang]
  );

  const value = useMemo(
    () => ({
      lang, colors: COLORS, isDark: true,
      setLang: persist(setLang, 'lang'),
      notifications, setNotifications: persist(setNotifications, 'notifications'),
      autoDelete, setAutoDelete: persist(setAutoDelete, 'auto_delete'),
      t,
    }),
    [lang, notifications, autoDelete, t, persist]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
