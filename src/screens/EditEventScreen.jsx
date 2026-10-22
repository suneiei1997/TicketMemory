import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import EventForm from '../components/event-form';
import Screen from '../components/screen';
import { useEvents } from '../context/EventsContext';
import { useSettings } from '../context/SettingsContext';
import { colors as tk, type } from '../theme/tokens';

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { events, updateEvent } = useEvents();
  const { t } = useSettings();
  const event = events.find((e) => e.id === id);

  if (!event) return null;

  return (
    <Screen>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{t('editConcert')}</Text>
      <EventForm
        initial={event}
        submitLabel={t('saveChanges')}
        onSubmit={async (data) => {
          await updateEvent(id, data);
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
