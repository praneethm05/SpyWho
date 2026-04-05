/**
 * SpyWho — Root App Component
 *
 * Wraps the app in:
 * 1. GameProvider (global game state)
 * 2. NavigationContainer
 * 3. RootNavigator (screen stack)
 */
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { GameProvider } from './src/context/GameContext';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { initSounds } from './src/utils/sound';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  const [loaded, error] = useFonts({
    'Fredoka-Regular': require('./assets/fonts/Fredoka-Regular.ttf'),
    'Fredoka-Medium': require('./assets/fonts/Fredoka-Medium.ttf'),
    'Fredoka-SemiBold': require('./assets/fonts/Fredoka-SemiBold.ttf'),
    'Fredoka-Bold': require('./assets/fonts/Fredoka-Bold.ttf'),
  });

  useEffect(() => {
    async function loadResources() {
      if (loaded || error) {
        await initSounds();

        // Request Notification Permissions if physically running on device
        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
          }
        }

        await SplashScreen.hideAsync();
      }
    }
    loadResources();
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <GameProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}
