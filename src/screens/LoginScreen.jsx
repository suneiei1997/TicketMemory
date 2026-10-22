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

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useSettings();
  const { signIn } = useProfile();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError(t('errEmail'));
    if (password.length < 6) return setError(t('errPassword'));
    setError('');
    setBusy(true);
    const { error: err } = await signIn(email.trim(), password);
    setBusy(false);
    if (err) return setError(err.code === 'invalid_credentials' ? t('errWrongPassword') : `${t('errNetwork')} (${err.message})`);
    // On success the session changes and the root layout swaps in the tabs.
  };

  return (
    <Screen>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bounces={false}>
      <MeshGradient texture palette="orchid" style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.brand}>TicketMemory</Text>
        <Text style={styles.tag}>{t('welcome')}</Text>
      </MeshGradient>

      <View style={styles.form}>
        <Field label={t('email')} value={email} onChangeText={setEmail} placeholder={t('emailPh')} keyboardType="email-address" autoCapitalize="none" />
        <Field label={t('password')} value={password} onChangeText={setPassword} placeholder={t('passwordPh')} secureTextEntry />
        {!!error && <Text style={styles.error}>{error}</Text>}
        <Button label={t('login')} onPress={handleLogin} disabled={busy} style={styles.btn} />
        <Pressable style={styles.link} onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>{t('createAccount')}</Text>
        </Pressable>
      </View>
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1 },
  hero: { minHeight: 340, paddingHorizontal: 24, paddingBottom: 28, justifyContent: 'flex-end', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  brand: { fontFamily: font.bold, fontSize: 52, lineHeight: 64, letterSpacing: -1.5, color: '#0A0A0A' },
  tag: { fontFamily: font.medium, fontSize: 15, lineHeight: 22, color: '#0A0A0A', opacity: 0.7, marginTop: 8 },
  form: { padding: 24, paddingTop: 32 },
  error: { ...type.body, color: tk.danger, marginBottom: 8 },
  btn: { marginTop: 8 },
  link: { alignItems: 'center', marginTop: 20, padding: 8 },
  linkText: { ...type.bodyStrong, color: tk.lime },
});
