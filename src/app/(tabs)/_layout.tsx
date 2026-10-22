import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useSettings } from '@/context/SettingsContext';
import { useTicketing } from '@/context/TicketingContext';

// Native tab bar: liquid glass on iOS 26+, Material on Android.
export default function TabsLayout() {
  const { colors, t } = useSettings();
  const { rounds } = useTicketing();
  const waiting = rounds.filter((r: { result: string }) => r.result === 'pending').length;

  return (
    <NativeTabs tintColor={colors.accent} labelStyle={{ fontFamily: 'Anuphan_500Medium' }} minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('tabConcerts')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="music.note.list" md="queue_music" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>{t('tabCalendar')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="pray">
        <NativeTabs.Trigger.Label>{t('tabPray')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="hands.sparkles.fill" md="volunteer_activism" />
        {waiting > 0 && <NativeTabs.Trigger.Badge>{String(waiting)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Label>{t('tabExplore')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkle.magnifyingglass" md="insights" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="personal">
        <NativeTabs.Trigger.Label>{t('tabPersonal')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
