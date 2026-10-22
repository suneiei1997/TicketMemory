import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useProfile } from './ProfileContext';

const TicketingContext = createContext(/** @type {any} */ (null));

const fromRow = (r) => ({
  id: r.id,
  title: r.title,
  artist: r.artist,
  saleAt: r.sale_at,
  platform: r.platform,
  url: r.url,
  note: r.note,
  prayers: r.prayers,
  result: r.result,
  eventId: r.event_id,
});

const toRow = (d) => ({
  title: d.title,
  artist: d.artist ?? '',
  sale_at: d.saleAt,
  platform: d.platform ?? '',
  url: d.url ?? '',
  note: d.note ?? '',
});

export function TicketingProvider({ children }) {
  const { userId } = useProfile();
  const [store, setStore] = useState({ userId: null, list: [] });
  const rounds = useMemo(() => (store.userId === userId ? store.list : []), [store, userId]);
  const loading = !!userId && store.userId !== userId;
  const setRounds = useCallback(
    (fn) => setStore((s) => ({ ...s, list: typeof fn === 'function' ? fn(s.list) : fn })),
    []
  );

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('ticketing_rounds').select('*').order('sale_at');
      if (!cancelled) setStore({ userId, list: (data ?? []).map(fromRow) });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const addRound = useCallback(
    async (data) => {
      const { data: row, error } = await supabase.from('ticketing_rounds').insert(toRow(data)).select().single();
      if (error) throw error;
      setRounds((prev) => [...prev, fromRow(row)].sort((a, b) => a.saleAt.localeCompare(b.saleAt)));
      return row.id;
    },
    [setRounds]
  );

  const updateRound = useCallback(
    async (id, data) => {
      const { data: row, error } = await supabase.from('ticketing_rounds').update(toRow(data)).eq('id', id).select().single();
      if (error) throw error;
      setRounds((prev) => prev.map((r) => (r.id === id ? fromRow(row) : r)).sort((a, b) => a.saleAt.localeCompare(b.saleAt)));
    },
    [setRounds]
  );

  const deleteRound = useCallback(
    async (id) => {
      const { error } = await supabase.from('ticketing_rounds').delete().eq('id', id);
      if (error) throw error;
      setRounds((prev) => prev.filter((r) => r.id !== id));
    },
    [setRounds]
  );

  // Optimistic: the counter moves right away, the save follows (rolled back if it fails).
  const pray = useCallback(
    async (id) => {
      let next = 0;
      setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, prayers: (next = r.prayers + 1) } : r)));
      const { error } = await supabase.from('ticketing_rounds').update({ prayers: next }).eq('id', id);
      if (error) setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, prayers: r.prayers - 1 } : r)));
    },
    [setRounds]
  );

  const setResult = useCallback(
    async (id, result, eventId = null) => {
      const patch = { result, event_id: eventId };
      const { error } = await supabase.from('ticketing_rounds').update(patch).eq('id', id);
      if (error) throw error;
      setRounds((prev) => prev.map((r) => (r.id === id ? { ...r, result, eventId } : r)));
    },
    [setRounds]
  );

  const value = useMemo(
    () => ({ rounds, loading, addRound, updateRound, deleteRound, pray, setResult }),
    [rounds, loading, addRound, updateRound, deleteRound, pray, setResult]
  );

  return <TicketingContext.Provider value={value}>{children}</TicketingContext.Provider>;
}

export function useTicketing() {
  const ctx = useContext(TicketingContext);
  if (!ctx) throw new Error('useTicketing must be used inside TicketingProvider');
  return ctx;
}
