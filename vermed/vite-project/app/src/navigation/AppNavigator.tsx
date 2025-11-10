import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';
import HomeScreen from '@/screens/HomeScreen';
import SearchScreen from '@/screens/SearchScreen';
import ResultsScreen from '@/screens/ResultsScreen';
import ScannerScreen from '@/screens/ScannerScreen';
import MasHelperScreen from '@/screens/MasHelperScreen';
import RecentScreen from '@/screens/RecentScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useAppStore } from '@/state/store';

export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  Results: { lookupId: string };
  Scanner: undefined;
  MasHelper: undefined;
  Recent: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  const { language } = useAppStore();

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#333333',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: '#f8f9fa',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'VerMed',
            headerRight: () => (
              <View style={styles.headerRight}>
                <Text style={styles.versionText}>v1.0.0</Text>
              </View>
            ),
          }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{
            title: 'Search Medicine',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{
            title: 'Verification Result',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Scanner"
          component={ScannerScreen}
          options={{
            title: 'Scan Medicine',
            headerBackTitleVisible: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="MasHelper"
          component={MasHelperScreen}
          options={{
            title: 'MAS Helper',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Recent"
          component={RecentScreen}
          options={{
            title: 'Recent Verifications',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
});