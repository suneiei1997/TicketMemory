import { supabase } from '../lib/supabase';

const isRemote = (uri) => /^https?:\/\//.test(uri || '');

// Uploads a local image uri to <bucket>/<userId>/<random>.jpg and resolves to the storage path.
export async function uploadImage(bucket, userId, uri) {
  const body = await (await fetch(uri)).arrayBuffer();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

export async function removeImages(bucket, paths) {
  const list = paths.filter(Boolean);
  if (list.length) await supabase.storage.from(bucket).remove(list);
}

// Resolves to a { path: signedUrl } map; failures simply leave a path out.
export async function signedUrls(bucket, paths) {
  const list = [...new Set(paths.filter(Boolean))];
  if (!list.length) return {};
  const { data } = await supabase.storage.from(bucket).createSignedUrls(list, 3600);
  const out = {};
  for (const row of data ?? []) if (row.signedUrl) out[row.path] = row.signedUrl;
  return out;
}

export { isRemote };
