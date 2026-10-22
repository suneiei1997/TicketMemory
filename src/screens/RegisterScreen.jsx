import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/button';
import Field from '../components/field';
import MeshGradient from '../components/mesh-gradient';
import Screen from '../components/screen';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';
import { colors as tk, font, type } from '../theme/tokens';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useSettings();
  const { register } = useProfile();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const email = form.email.trim();
    if (!form.name.trim()) return setError(t('errDisplayName'));
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t('errEmail'));
    if (form.password.length < 6) return setError(t('errPassword'));
    if (form.password !== form.confirm) return setError(t('errConfirm'));
    setError('');
    setBusy(true);
    const { error: err } = await register(form.name.trim(), email, form.password);
    setBusy(false);
    if (err) return setError(err.code === 'user_already_exists' ? t('errEmailTaken') : `${t('errNetwork')} (${err.message})`);
    // The session change swaps in the tabs from the root layout.
  };

  return (
    <Screen>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bounces={false}>
      <MeshGradient texture palette="ultraviolet" style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>{t('createAccount')}</Text>
      </MeshGradient>

      <View style={styles.form}>
        <Field label={t('displayName')} value={form.name} onChangeText={set('name')} autoCapitalize="words" />
        <Field label={t('email')} value={form.email} onChangeText={set('email')} placeholder={t('emailPh')} keyboardType="email-address" autoCapitalize="none" />
        <Field label={t('password')} value={form.password} onChangeText={set('password')} placeholder={t('passwordPh')} secureTextEntry />
        <Field label={t('confirmPassword')} value={form.confirm} onChangeText={set('confirm')} secureTextEntry />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button label={t('createAccount')} onPress={submit} disabled={busy} style={styles.btn} />
        <Pressable style={styles.link} onPress={() => router.back()}>
          <Text style={styles.linkText}>{t('haveAccount')}</Text>
        </Pressable>
      </View>
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  hero: { minHeight: 240, paddingHorizontal: 24, paddingBottom: 28, justifyContent: 'flex-end', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  title: { fontFamily: font.bold, fontSize: 44, lineHeight: 60, letterSpacing: 0, color: '#0A0A0A' },
  form: { padding: 24, paddingTop: 28 },
  error: { ...type.body, color: tk.danger, marginBottom: 8 },
  btn: { marginTop: 8 },
  link: { alignItems: 'center', marginTop: 20, padding: 8 },
  linkText: { ...type.bodyStrong, color: tk.lime },
});
