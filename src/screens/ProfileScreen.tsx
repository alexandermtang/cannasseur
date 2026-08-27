import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import PrimaryButton from '@/components/PrimaryButton';
import TertiaryButton from '@/components/TertiaryButton';
import HeaderButton from '@/components/HeaderButton';
import { supabase, currentUserId } from '@/lib/supabase';
import type { AppScreenProps } from '@/types/navigation';

export const profileScreenOptions = ({
  navigation
}: AppScreenProps<'Me'>): NativeStackNavigationOptions => ({
  title: 'PROFILE',
  headerLeft: () => (
    <HeaderButton name={'chevron-back'} onPress={() => navigation.goBack()} />
  )
});

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const userId = await currentUserId();
      if (!userId) {
        return;
      }

      // Email lives on the auth user, not on profiles — single source of truth.
      const [{ data: profile }, { data: userData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('name')
          .eq('id', userId)
          .single(),
        supabase.auth.getUser()
      ]);

      setName(profile ? profile.name : '');
      setEmail(userData.user ? userData.user.email || '' : '');
    })();
  }, []);

  const logout = async () => {
    // onAuthStateChange in App.js swaps back to the auth stack (and resets
    // Home's filters, so the next account doesn't inherit this one's).
    await supabase.auth.signOut();
  };

  const confirmDeleteAccount = () => {
    Alert.alert('Are you sure?', undefined, [
      { text: 'NO', style: 'cancel' },
      { text: 'YES', style: 'destructive', onPress: () => deleteAccount() }
    ]);
  };

  const deleteAccount = async () => {
    // TODO: no account-deletion API exists yet.
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{name}</Text>
      <Text style={[styles.text, { marginBottom: 64 }]}>{email}</Text>
      <PrimaryButton style={styles.button} onPress={() => logout()} text={'LOG OUT'} />
      <TertiaryButton
        style={styles.deleteButton}
        onPress={() => confirmDeleteAccount()}
        text={'DELETE ACCOUNT'}
      />
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
  },
  button: {
    width: '100%'
  },
  deleteButton: {
    width: '100%',
    marginTop: 16
  }
});

export default ProfileScreen;
