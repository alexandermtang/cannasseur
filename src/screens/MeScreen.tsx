import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import BlackButton from '../components/BlackButton';
import HeaderButton from '../components/HeaderButton';
import { supabase, currentUserId } from '../lib/supabase';
import type { AppScreenProps } from '../types/navigation';

export const meScreenOptions = ({
  navigation
}: AppScreenProps<'Me'>): NativeStackNavigationOptions => ({
  title: 'PROFILE',
  headerLeft: () => (
    <HeaderButton name={'chevron-back-circle-outline'} onPress={() => navigation.goBack()} />
  )
});

const MeScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    (async () => {
      const userId = await currentUserId();
      if (!userId) {
        return;
      }

      // Email lives on the auth user, not on profiles — single source of truth.
      const [{ data: profile }, { data: userData }, { count }] = await Promise.all([
        supabase
          .from('profiles')
          .select('name')
          .eq('id', userId)
          .single(),
        supabase.auth.getUser(),
        supabase
          .from('logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
      ]);

      setName(profile ? profile.name : '');
      setEmail(userData.user ? userData.user.email || '' : '');
      setSessionCount(count || 0);
    })();
  }, []);

  const logout = async () => {
    // onAuthStateChange in App.js swaps back to the auth stack.
    await supabase.auth.signOut();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name}</Text>
      <Text style={styles.text}>{email}</Text>
      <Text style={[styles.text, { marginBottom: 64 }]}>
        {sessionCount} session {sessionCount === 1 ? 'entry' : 'entries'}
      </Text>
      <BlackButton onPress={() => logout()} text={'LOG OUT'} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular',
    height: 32,
    marginBottom: 16
  }
});

export default MeScreen;
