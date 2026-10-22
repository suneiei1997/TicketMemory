import { Platform } from 'react-native';

// Web-only persistence; native keeps values for the session only.
const available = () => Platform.OS === 'web' && typeof localStorage !== 'undefined';

export function loadJSON(key) {
  try {
    if (available()) return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {}
  return {};
}

export function saveJSON(key, value) {
  try {
    if (available()) localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}
