import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { isUpcoming } from '../utils/events';
import { syncEventNotifications } from '../utils/notifications';
import { isRemote, removeImages, signedUrls, uploadImage } from '../utils/upload-image';
import { useProfile } from './ProfileContext';
import { useTicketing } from './TicketingContext';
import { useSettings } from './SettingsContext';

const EventsContext = createContext(/** @type {any} */ (null));

const FIELDS = ['title', 'artist', 'venue', 'city', 'date', 'time', 'zone', 'section', 'row', 'seat', 'currency'];

// DB row -> the event shape the screens already use.
const fromRow = (r, urls) => ({
  id: r.id,
  title: r.title,
  artist: r.artist,
  venue: r.venue,
  city: r.city,
  date: r.date,
  time: r.time ?? '',
  zone: r.zone,
  section: r.section,
  row: r.row,
  seat: r.seat,
  price: r.price == null ? '' : String(r.price),
  currency: r.currency ?? 'THB',
  color: r.color ?? '',
  purchaseChannel: r.purchase_channel ?? '',
  ticketImage: r.ticket_image_path ? urls[r.ticket_image_path] ?? null : null,
  ticketImagePath: r.ticket_image_path,
});

export function EventsProvider({ children }) {
  const { userId } = useProfile();
  const { rounds } = useTicketing();
  const [store, setStore] = useState({ userId: null, list: [] });
  const events = useMemo(() => (store.userId === userId ? store.list : []), [store, userId]);
  const loading = !!userId && store.userId !== userId;
  const setEvents = useCallback(
    (fn) => setStore((s) => ({ ...s, list: typeof fn === 'function' ? fn(s.list) : fn })),
    []
  );
  const { t, notifications, autoDelete } = useSettings();

  // Load the signed-in user's tickets; clear them on sign out.
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('events').select('*').order('date');
      const rows = data ?? [];
      const urls = await signedUrls('tickets', rows.map((r) => r.ticket_image_path));
      if (cancelled) return;
      setStore({ userId, list: rows.map((r) => fromRow(r, urls)) });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const deletePast = useCallback(async () => {
    const past = events.filter((e) => !isUpcoming(e));
    if (!past.length) return;
    const ids = past.map((e) => e.id);
    const { error } = await supabase.from('events').delete().in('id', ids);
    if (error) throw error;
    await removeImages('tickets', past.map((e) => e.ticketImagePath));
    setEvents((prev) => prev.filter((e) => !ids.includes(e.id)));
  }, [events, setEvents]);

  // With auto-delete on, sweep tickets whose date and time have passed (now, then every minute).
  useEffect(() => {
    if (!autoDelete || !userId) return undefined;
    const sweep = () => deletePast().catch(() => {});
    const first = setTimeout(sweep, 0);
    const timer = setInterval(sweep, 60 * 1000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [autoDelete, userId, deletePast]);

  // Keep scheduled reminders in step with the list, the language and the settings toggle.
  useEffect(() => {
    syncEventNotifications(events, t, notifications, rounds).catch(() => {});
  }, [events, t, notifications, rounds]);

  // Uploads a newly picked ticket photo; existing remote/stored ones are left alone.
  const resolveImage = useCallback(
    async (data, current) => {
      const uri = data.ticketImage;
      if (!uri) return { path: null, url: null };
      if (isRemote(uri) && current) return { path: current.ticketImagePath, url: current.ticketImage };
      const path = await uploadImage('tickets', userId, uri);
      return { path, url: (await signedUrls('tickets', [path]))[path] ?? null };
    },
    [userId]
  );

  const pick = (data) => ({
    ...Object.fromEntries(FIELDS.map((k) => [k, data[k] ?? ''])),
    currency: data.currency || 'THB',
    price: data.price === '' || data.price == null || Number.isNaN(Number(data.price)) ? null : Number(data.price),
    purchase_channel: data.purchaseChannel ?? '',
    color: data.color || null,
  });

  const addEvent = useCallback(
    async (data) => {
      const img = await resolveImage(data, null);
      const { data: row, error } = await supabase
        .from('events')
        .insert({ ...pick(data), ticket_image_path: img.path })
        .select()
        .single();
      if (error) throw error;
      setEvents((prev) => [...prev, fromRow(row, { [img.path]: img.url })]);
      return row.id;
    },
    [resolveImage, setEvents]
  );

  const updateEvent = useCallback(
    async (id, data) => {
      const current = events.find((e) => e.id === id);
      const img = await resolveImage(data, current);
      const { data: row, error } = await supabase
        .from('events')
        .update({ ...pick(data), ticket_image_path: img.path })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      if (current?.ticketImagePath && current.ticketImagePath !== img.path) {
        await removeImages('tickets', [current.ticketImagePath]);
      }
      setEvents((prev) => prev.map((e) => (e.id === id ? fromRow(row, { [img.path]: img.url }) : e)));
    },
    [events, resolveImage, setEvents]
  );

  const deleteEvent = useCallback(
    async (id) => {
      const current = events.find((e) => e.id === id);
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      await removeImages('tickets', [current?.ticketImagePath]);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    },
    [events, setEvents]
  );

  const value = useMemo(
    () => ({ events, loading, addEvent, updateEvent, deleteEvent, deletePast }),
    [events, loading, addEvent, updateEvent, deleteEvent, deletePast]
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
