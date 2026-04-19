// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Built-in Expo icons

// Import our new screens
import MapScreen from './screens/MapScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import HomeScreen from './screens/HomeScreen';
import PrivateDashboardScreen from './screens/PrivateScreen';
import StaticModeScreen from './screens/StaticModeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const linking = {
  prefixes: ['mallNavigator://'],
  config: {
    screens: {
      Home: 'home',
      GlobalTabs: 'tabs',
      StaticMode: 'static',
      PrivateDashboard: {
        path: 'join',
        parse: {
          inviteCode: (value) => String(value || '').trim(),
          autoJoin: (value) => value === '1' || value === 'true',
          eventDiscoveryRadius: (value) => String(value || '').trim(),
        },
      },
    },
  },
};

function GlobalTabsNavigator({ route }) {
  const eventId = route?.params?.eventId ?? null;
  const eventName = route?.params?.eventName ?? null;
  const eventDiscoveryRadius = route?.params?.eventDiscoveryRadius ?? null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Consistent design: Set up dynamic icons based on the active tab
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Leaderboard') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#28a745', // Green to match your 'Log Discovery' button
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // We hide the top header for a cleaner fullscreen look
      })}
    >
      <Tab.Screen name="Map">
        {(props) => <MapScreen {...props} eventId={eventId} eventName={eventName} eventDiscoveryRadius={eventDiscoveryRadius} />}
      </Tab.Screen>
      <Tab.Screen name="Leaderboard">
        {(props) => <LeaderboardScreen {...props} eventId={eventId} eventName={eventName} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GlobalTabs" component={GlobalTabsNavigator} />
        <Stack.Screen name="StaticMode" component={StaticModeScreen} />
        <Stack.Screen name="PrivateDashboard" component={PrivateDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
