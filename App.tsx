import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import { resetHomeFilters } from '@/lib/homeFilters';
import type { AuthStackParamList, AppStackParamList } from '@/types/navigation';

import LoginScreen from '@/screens/Auth/LoginScreen';
import SignUpScreen from '@/screens/Auth/SignUpScreen';
import SignUpLoginScreen from '@/screens/Auth/SignUpLoginScreen';
import ForgotPasswordScreen from '@/screens/Auth/ForgotPasswordScreen';

import HomeScreen, { homeScreenOptions } from '@/screens/HomeScreen';
import ProfileScreen, { profileScreenOptions } from '@/screens/ProfileScreen';
import LogNewSessionScreen, {
  logNewSessionScreenOptions
} from '@/screens/LogNewSessionScreen';
import SubmitLogScreen, { submitLogScreenOptions } from '@/screens/SubmitLogScreen';
import ViewLogScreen, { viewLogScreenOptions } from '@/screens/ViewLogScreen';

LogBox.ignoreAllLogs();

SplashScreen.preventAutoHideAsync();

const AuthStackNavigator = createNativeStackNavigator<AuthStackParamList>();
const AppStackNavigator = createNativeStackNavigator<AppStackParamList>();

const linking = {
  prefixes: ['cannasseur://'],
  config: {
    screens: {
      Login: 'login'
    }
  }
};

const appScreenOptions = {
  headerStyle: { backgroundColor: '#F4F3EF' },
  headerTintColor: '#000',
  headerTitleStyle: { fontFamily: 'WorkSans' }
};

const AuthStack = () => (
  <AuthStackNavigator.Navigator
    initialRouteName={'SignUpLogin'}
    screenOptions={{ headerShown: false }}
  >
    <AuthStackNavigator.Screen name={'SignUpLogin'} component={SignUpLoginScreen} />
    <AuthStackNavigator.Screen name={'Login'} component={LoginScreen} />
    <AuthStackNavigator.Screen name={'SignUp'} component={SignUpScreen} />
    <AuthStackNavigator.Screen name={'ForgotPassword'} component={ForgotPasswordScreen} />
  </AuthStackNavigator.Navigator>
);

const AppStack = () => (
  <AppStackNavigator.Navigator initialRouteName={'Home'} screenOptions={appScreenOptions}>
    <AppStackNavigator.Screen name={'Home'} component={HomeScreen} options={homeScreenOptions} />
    <AppStackNavigator.Screen name={'Me'} component={ProfileScreen} options={profileScreenOptions} />
    <AppStackNavigator.Screen
      name={'LogNewSession'}
      component={LogNewSessionScreen}
      options={logNewSessionScreenOptions}
    />
    <AppStackNavigator.Screen
      name={'SubmitLog'}
      component={SubmitLogScreen}
      options={submitLogScreenOptions}
    />
    <AppStackNavigator.Screen
      name={'ViewLog'}
      component={ViewLogScreen}
      options={viewLogScreenOptions}
    />
  </AppStackNavigator.Navigator>
);

const App = () => {
  const [fontsLoaded] = useFonts({
    'PlayfairDisplay-Italic': require('./assets/fonts/PlayfairDisplay-Italic.ttf'),
    'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
    WorkSans: require('./assets/fonts/WorkSans-Regular.ttf'),
    'WorkSans-Bold': require('./assets/fonts/WorkSans-Bold.ttf')
  });

  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession) {
        resetHomeFilters();
      }
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const isReady = fontsLoaded && sessionChecked;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          {session ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
