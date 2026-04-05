/**
 * RootNavigator — stack navigator defining the app's screen flow.
 *
 * Home → Setup → PlayerNames → GameRound → RoundSummary
 */
import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ghost, CaretLeft } from 'phosphor-react-native';
import type { RootStackParamList } from '../../types/navigation.types';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Pressable } from 'react-native';
import { HomeScreen } from '../../screens/HomeScreen';
import { SetupScreen } from '../../screens/SetupScreen';
import { PlayerNamesScreen } from '../../screens/PlayerNamesScreen';
import { GameRoundScreen } from '../../screens/GameRoundScreen';
import { RoundSummaryScreen } from '../../screens/RoundSummaryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// HeaderTitle removed (now handled by in-screen Header component)

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Setup"
        component={SetupScreen}
      />
      <Stack.Screen
        name="PlayerNames"
        component={PlayerNamesScreen}
      />
      <Stack.Screen
        name="GameRound"
        component={GameRoundScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="RoundSummary"
        component={RoundSummaryScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
