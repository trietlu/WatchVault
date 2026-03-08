import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  type LinkingOptions,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../stores/useAuthStore';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NewWatchScreen from '../screens/watches/NewWatchScreen';
import WatchDetailScreen from '../screens/watches/WatchDetailScreen';
import AddEventScreen from '../screens/watches/AddEventScreen';
import PublicPassportScreen from '../screens/PublicPassportScreen';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/tokens';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'https://watchvault.app', 'https://www.watchvault.app'],
  config: {
    screens: {
      Home: '',
      Login: 'login',
      Register: 'register',
      Dashboard: 'dashboard',
      NewWatch: 'watches/new',
      WatchDetail: 'watches/:watchId',
      AddEvent: 'watches/:watchId/add-event',
      PublicPassport: 'p/:publicId',
    },
  },
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    primary: colors.primary,
    text: colors.text,
    card: colors.surface,
    border: colors.border,
  },
};

function UnauthenticatedStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'WatchVault' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Create Account' }}
      />
      <Stack.Screen
        name="PublicPassport"
        component={PublicPassportScreen}
        options={{ title: 'Public Passport' }}
      />
    </Stack.Navigator>
  );
}

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Collection' }}
      />
      <Stack.Screen
        name="NewWatch"
        component={NewWatchScreen}
        options={{ title: 'Mint Watch' }}
      />
      <Stack.Screen
        name="WatchDetail"
        component={WatchDetailScreen}
        options={{ title: 'Watch Detail' }}
      />
      <Stack.Screen
        name="AddEvent"
        component={AddEventScreen}
        options={{ title: 'Add Event' }}
      />
      <Stack.Screen
        name="PublicPassport"
        component={PublicPassportScreen}
        options={{ title: 'Public Passport' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrated = useAuthStore((state) => state.hydrated);

  if (!hydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking} theme={navTheme}>
      {isAuthenticated ? <AuthenticatedStack /> : <UnauthenticatedStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
