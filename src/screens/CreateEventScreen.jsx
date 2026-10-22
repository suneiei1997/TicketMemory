import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EventForm from '../components/event-form';
import Screen from '../components/screen';
import { useEvents } from '../context/EventsContext';
import { useSettings } from '../context/SettingsContext';
import { useTicketing } from '../context/TicketingContext';
import { colors as tk, type } from '../theme/tokens';
import { randomPaletteKey } from '../theme/ticket-palettes';

export default function CreateEventScreen() {
  const router = useRouter();
  const { fromRound, title, artist } = useLocalSearchParams();
  const { addEvent } = useEvents();
  const { setResult } = useTicketing();
  const { t } = useSettings();
  const [color] = useState(randomPaletteKey); // new tickets start with a random colour

  return (
    <Screen>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('newConcert')}</Text>
      <EventForm
        initial={{ title: title ?? '', artist: artist ?? '', color }}
        submitLabel={t('saveConcert')}
        onSubmit={async (data) => {
          const id = await addEvent(data);
          // A round that turned into a ticket is marked as won and linked to it.
          if (fromRound) await setResult(fromRound, 'got', id).catch(() => {});
          router.back();
        }}
      />
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: { ...type.display, color: tk.text, marginTop: 8, marginBottom: 20 },
});
