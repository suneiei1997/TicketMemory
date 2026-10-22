import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { removeImages, signedUrls, uploadImage } from '../utils/upload-image';

const ProfileContext = createContext(/** @type {any} */ (null));

export function ProfileProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // Raw profiles row and avatar signed url, tagged with the user they belong to.
  const [loaded, setLoaded] = useState({ userId: null, profile: null, avatar: null });

  const userId = session?.user?.id ?? null;
  const own = loaded.userId === userId;
  const profile = own ? loaded.profile : null;
  const avatar = own ? loaded.avatar : null;
  const setProfile = useCallback(
    (fn) => setLoaded((l) => ({ ...l, profile: typeof fn === 'function' ? fn(l.profile) : fn })),
    []
  );
  const setAvatarUrl = useCallback((avatar) => setLoaded((l) => ({ ...l, avatar })), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  // Load the profile row whenever the signed-in user changes.
  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (cancelled || !data) return;
      const urls = data.avatar_path ? await signedUrls('avatars', [data.avatar_path]) : {};
      if (!cancelled) setLoaded({ userId, profile: data, avatar: urls[data.avatar_path] ?? null });
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const updateProfile = useCallback(
    async (patch) => {
      if (!userId) return;
      setProfile((p) => (p ? { ...p, ...patch } : p));
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
      if (error) throw error;
    },
    [userId, setProfile]
  );

  const setName = useCallback((name) => updateProfile({ display_name: name }), [updateProfile]);

  // uri = local image to upload, or null to remove the photo.
  const setAvatar = useCallback(
    async (uri) => {
      if (!userId) return;
      const old = profile?.avatar_path;
      const path = uri ? await uploadImage('avatars', userId, uri) : null;
      await updateProfile({ avatar_path: path });
      await removeImages('avatars', [old]);
      if (path) setAvatarUrl((await signedUrls('avatars', [path]))[path] ?? null);
      else setAvatarUrl(null);
    },
    [userId, profile, updateProfile, setAvatarUrl]
  );

  // Each of these resolves to { error } (error is null on success).
  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const register = useCallback(async (displayName, email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  }, []);

  const value = useMemo(
    () => ({
      session,
      loading,
      profile,
      name: profile?.display_name ?? '',
      avatar,
      email: session?.user?.email ?? '',
      userId,
      setName,
      setAvatar,
      updateProfile,
      signIn,
      signOut,
      register,
    }),
    [session, loading, profile, avatar, userId, setName, setAvatar, updateProfile, signIn, signOut, register]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
