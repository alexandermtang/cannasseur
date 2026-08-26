import 'react-native-gesture-handler';

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, LogBox } from 'react-native';
// DEAD CODE (for now): only needed by the commented-out cannasseur://
// reset-password deep-link handling below. Password reset is webpage-only
// now (see docs/reset-password.html) - re-add this if the native in-app
// flow comes back.
// import { Linking } from 'react-native';
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

import LoginScreen from './src/screens/Auth/LoginScreen';
import SignUpScreen from './src/screens/Auth/SignUpScreen';
import SignUpLoginScreen from './src/screens/Auth/SignUpLoginScreen';
import ForgotPasswordScreen from './src/screens/Auth/ForgotPasswordScreen';
// DEAD CODE (for now): see the comment on the Linking import above.
// import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';

import HomeScreen, { homeScreenOptions } from './src/screens/HomeScreen';
import MeScreen, { meScreenOptions } from './src/screens/MeScreen';
import LogNewSessionScreen, {
  logNewSessionScreenOptions
} from './src/screens/LogNewSessionScreen';
import SubmitLogScreen, { submitLogScreenOptions } from './src/screens/SubmitLogScreen';
import ViewLogScreen, { viewLogScreenOptions } from './src/screens/ViewLogScreen';

LogBox.ignoreAllLogs();

SplashScreen.preventAutoHideAsync();

const AuthStackNavigator = createNativeStackNavigator<AuthStackParamList>();
const AppStackNavigator = createNativeStackNavigator<AppStackParamList>();

// Lets the "OPEN APP" button on the post-reset webpage
// (docs/reset-password.html) drop the user onto Login.
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
    <AppStackNavigator.Screen name={'Me'} component={MeScreen} options={meScreenOptions} />
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

  // Replaces AuthLoadingScreen and the hand-rolled AsyncStorage 'userId' flag.
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // DEAD CODE (for now): password reset went webpage-only (see
  // docs/reset-password.html), so nothing produces a
  // cannasseur://reset-password deep link anymore to trigger this. Kept in
  // case the native in-app flow comes back later.
  // const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  //
  // useEffect(() => {
  //   // supabase.ts sets detectSessionInUrl: false (there's no browser URL to
  //   // detect on a native app), so a recovery deep link has to be parsed and
  //   // turned into a session by hand - Supabase's automatic PASSWORD_RECOVERY
  //   // event only fires from that URL-detection path, which is off here.
  //   const handleUrl = (url: string) => {
  //     if (!url.startsWith('cannasseur://reset-password')) {
  //       return;
  //     }
  //
  //     const fragment = url.split('#')[1] ?? '';
  //     const params = new URLSearchParams(fragment);
  //     const accessToken = params.get('access_token');
  //     const refreshToken = params.get('refresh_token');
  //
  //     if (params.get('type') === 'recovery' && accessToken && refreshToken) {
  //       setIsPasswordRecovery(true);
  //       supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  //     }
  //   };
  //
  //   Linking.getInitialURL().then(url => {
  //     if (url) {
  //       handleUrl(url);
  //     }
  //   });
  //
  //   const subscription = Linking.addEventListener('url', ({ url }) => handleUrl(url));
  //
  //   return () => subscription.remove();
  // }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Covers every way a session can end (the LOG OUT button, an expired
      // or revoked token, etc.), not just the explicit sign-out action —
      // otherwise the next account to sign in on this device could inherit
      // stale Home filters from whoever was signed in before.
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
        {/* DEAD CODE (for now): isPasswordRecovery branch, see the comment
            above. */}
        {/* {isPasswordRecovery ? (
          <ResetPasswordScreen onComplete={() => setIsPasswordRecovery(false)} />
        ) : ( */}
        <NavigationContainer linking={linking}>
          {session ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
        {/* )} */}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
