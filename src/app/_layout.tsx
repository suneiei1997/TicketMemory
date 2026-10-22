import {
  Anuphan_400Regular,
  Anuphan_500Medium,
  Anuphan_600SemiBold,
  Anuphan_700Bold,
  useFonts,
} from '@expo-google-fonts/anuphan';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { EventsProvider } from '@/context/EventsContext';
import { ProfileProvider, useProfile } from '@/context/ProfileContext';
import { SettingsProvider, useSettings } from '@/context/SettingsContext';
import { TicketingProvider } from '@/context/TicketingContext';

SplashScreen.preventAutoHideAsync();

// Signed-out users only see login/register; signed-in users only see the app.
function Routes() {
  const { session, loading } = useProfile();
  const { colors } = useSettings();
  const [fontsLoaded] = useFonts({ Anuphan_400Regular, Anuphan_500Medium, Anuphan_600SemiBold, Anuphan_700Bold });
  if (loading || !fontsLoaded) return null; // the splash overlay covers this while the session and fonts load

  return (
    <ThemeProvider value={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg } }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" />
          <Stack.Screen name="event/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="event/edit/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="ticketing/[id]" options={{ presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ProfileProvider>
      <SettingsProvider>
        <TicketingProvider>
          <EventsProvider>
            <AnimatedSplashOverlay />
            <Routes />
          </EventsProvider>
        </TicketingProvider>
      </SettingsProvider>
    </ProfileProvider>
  );
}
