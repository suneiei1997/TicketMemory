import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/avatar';
import Button from '../components/button';
import Field from '../components/field';
import MeshGradient from '../components/mesh-gradient';
import Panel from '../components/panel';
import Screen from '../components/screen';
import FilterMenu from '../components/filter-menu';
import ScreenHeader from '../components/screen-header';
import { useEvents } from '../context/EventsContext';
import { useProfile } from '../context/ProfileContext';
import { useSettings } from '../context/SettingsContext';
import { useTicketing } from '../context/TicketingContext';
import { colors as tk, font, type } from '../theme/tokens';
import {
  countScheduled,
  ensureNotificationPermission,
  notificationsSupported,
  sendTestNotification,
} from '../utils/notifications';
import { pickImage } from '../utils/pick-image';
import { summarize } from '../utils/stats';

const INK = '#0A0A0A';

function Row({ title, hint, children }) {
  return (
    <View style={styles.row}>
      <View style={styles.flex1}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!hint && <Text style={styles.rowHint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}

export default function PersonalScreen() {
  const insets = useSafeAreaInsets();
  const { events } = useEvents();
  const { rounds } = useTicketing();
  const { lang, setLang, notifications, setNotifications, autoDelete, setAutoDelete, t } = useSettings();
  const { name, avatar, email, setName, setAvatar, signOut } = useProfile();
  const [draft, setDraft] = useState(name);
  const [denied, setDenied] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const stats = useMemo(() => summarize(events, rounds), [events, rounds]);

  const changePhoto = async () => {
    const uri = await pickImage({ aspect: [1, 1] });
    if (uri) setAvatar(uri).catch(() => setTestMsg(t('errNetwork')));
  };

  const toggleNotifications = async (on) => {
    if (on) {
      const ok = await ensureNotificationPermission();
      setDenied(!ok);
      setNotifications(ok);
    } else {
      setDenied(false);
      setNotifications(false);
    }
  };

  const sendTest = async () => {
    const ok = await sendTestNotification(t);
    setDenied(!ok);
    setTestMsg(ok ? t('notifyTestSent', { n: await countScheduled() }) : t('notifyDenied'));
  };

  // The root layout's Stack.Protected sends the user back to login once the session clears.
  const logout = () => {
    signOut();
  };

  const track = { true: tk.lime, false: tk.line };

  return (
    <Screen>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8 }]}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <ScreenHeader title={t('personalTitle')} />

      <MeshGradient palette="orchid" texture style={styles.hero}>
        <Text style={styles.heroHello} numberOfLines={2}>{t('hello', { name })}</Text>
        <Pressable onPress={changePhoto} style={styles.heroAvatar} accessibilityLabel={t('changePhoto')}>
          <Avatar uri={avatar} name={name} size={56} />
        </Pressable>
      </MeshGradient>

      <View style={styles.rail}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t('statAttended')}</Text>
          <Text style={styles.statValue}>{stats.attended}<Text style={styles.statOf}> /{stats.total}</Text></Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t('statUpcoming')}</Text>
          <Text style={styles.statValue}>{stats.upcoming}<Text style={styles.statOf}> /{stats.total}</Text></Text>
        </View>
      </View>

      <Panel title={t('profile')}>
        <Text style={styles.email}>{email}</Text>
        <Field label={t('displayName')} value={draft} onChangeText={setDraft} style={styles.fieldFix} />
        <View style={styles.btnRow}>
          <Button label={t('saveName')} onPress={() => draft.trim() && setName(draft.trim()).catch(() => {})} style={styles.flex1} />
          {!!avatar && <Button label={t('removePhoto')} variant="outline" onPress={() => setAvatar(null).catch(() => {})} style={styles.flex1} />}
        </View>
      </Panel>

      <Panel title={t('language')}>
        <FilterMenu
          value={lang}
          onChange={setLang}
          options={[{ value: 'th', label: '', raw: 'ไทย' }, { value: 'en', label: '', raw: 'English' }]}
        />
      </Panel>

      <Panel title={t('notifications')}>
        {!notificationsSupported ? (
          <Text style={styles.rowHint}>{t('notifyUnavailable')}</Text>
        ) : (
          <>
            <Row title={t('notifyToggle')} hint={denied ? t('notifyDenied') : t('notifyHint')}>
              <Switch value={notifications} onValueChange={toggleNotifications} trackColor={track} thumbColor="#FFFFFF" />
            </Row>
            <Pressable onPress={sendTest} style={styles.testBtn}>
              <Text style={styles.testText}>{t('notifyTestBtn')}</Text>
            </Pressable>
            {!!testMsg && <Text style={styles.rowHint}>{testMsg}</Text>}
          </>
        )}
      </Panel>

      <Panel title={t('tickets')}>
        <Row title={t('autoDelete')} hint={t('autoDeleteHint')}>
          <Switch value={autoDelete} onValueChange={setAutoDelete} trackColor={track} thumbColor="#FFFFFF" />
        </Row>
      </Panel>

      <Panel title={t('account')}>
        <Text style={styles.rowHint}>{t('signedInAs')} {email}</Text>
        <Button label={t('logout')} variant="danger" onPress={logout} style={styles.logout} />
      </Panel>
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  flex1: { flex: 1 },
  hero: { borderRadius: 24, padding: 20, minHeight: 220, justifyContent: 'space-between' },
  heroHello: { fontFamily: font.bold, fontSize: 38, lineHeight: 52, letterSpacing: 0, color: INK, paddingRight: 60 },
  heroAvatar: { position: 'absolute', right: 16, bottom: 16 },
  rail: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stat: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: tk.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: tk.line },
  statLabel: { ...type.label, color: tk.sub },
  statValue: { fontFamily: font.bold, fontSize: 32, letterSpacing: -1, color: tk.text, marginTop: 2 },
  statOf: { color: tk.faint, fontSize: 20 },
  email: { ...type.body, color: tk.text, marginBottom: 12 },
  fieldFix: { flex: 0 },
  btnRow: { flexDirection: 'row', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  rowTitle: { ...type.bodyStrong, color: tk.text },
  rowHint: { ...type.body, fontSize: 13, color: tk.sub, marginTop: 2 },
  testBtn: { paddingVertical: 12 },
  testText: { ...type.bodyStrong, color: tk.lime },
  logout: { marginTop: 14 },
});
