import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Dialog from 'react-native-dialog';
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
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const userId = await currentUserId();
      if (!userId) {
        return;
      }

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
    await supabase.auth.signOut();
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
        onPress={() => setDeleteDialogVisible(true)}
        text={'DELETE ACCOUNT'}
      />
      <Dialog.Container visible={deleteDialogVisible}>
        <Dialog.Title>Are you sure?</Dialog.Title>
        <Dialog.Button label="NO" onPress={() => setDeleteDialogVisible(false)} />
        <Dialog.Button
          label="YES"
          onPress={() => {
            setDeleteDialogVisible(false);
            deleteAccount();
          }}
        />
      </Dialog.Container>
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
    marginTop: 89
  }
});

export default ProfileScreen;
