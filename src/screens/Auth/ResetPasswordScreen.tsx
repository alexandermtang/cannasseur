// DEAD CODE (for now): password reset went webpage-only, so nothing should
// render this screen anymore. Kept in case the native in-app flow comes
// back later. App.tsx still imports and can render it via
// isPasswordRecovery, but nothing produces a cannasseur://reset-password
// deep link anymore to trigger that path.
import React, { useState } from 'react';
import { Text, View, Image, StyleSheet, TextInput } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

import PrimaryButton from '../../components/PrimaryButton';
import { supabase } from '../../lib/supabase';

interface ResetPasswordScreenProps {
  // Called once the password is updated. The recovery session Supabase
  // already established is a real session, so from here App.tsx just falls
  // through to the normal signed-in stack - no separate login step.
  onComplete: () => void;
}

const ResetPasswordScreen = ({ onComplete }: ResetPasswordScreenProps) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (password === '') {
      setError('Missing password.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords must match.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    onComplete();
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent={'Updating password and logging in...'}
        textStyle={{ color: '#FFF', fontFamily: 'PlayfairDisplay-Regular' }}
      />
      <Image source={require('../../../assets/cannabis.png')} style={styles.logo} />
      <Text style={styles.title}>cannasseur</Text>
      <View style={styles.inputs}>
        <TextInput
          autoCapitalize={'none'}
          placeholder={'new password'}
          onChangeText={password => {
            setPassword(password);
            setError('');
          }}
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          autoCapitalize={'none'}
          placeholder={'confirm password'}
          onChangeText={confirmPassword => {
            setConfirmPassword(confirmPassword);
            setError('');
          }}
          style={styles.input}
          secureTextEntry
        />
      </View>
      <Text style={styles.error}>{error}</Text>
      <PrimaryButton
        text={'UPDATE PASSWORD'}
        onPress={() => {
          setIsLoading(true);
          onSubmit();
        }}
      />
      {/* Matches the box LoginScreen's GO BACK button would occupy below LOG
          IN - without it, this screen's shorter content re-centers and
          UPDATE PASSWORD sits lower than LOG IN does. */}
      <View style={styles.backButtonSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F3EF'
  },
  logo: {
    width: 150,
    height: 150,
    bottom: 16
  },
  title: {
    bottom: 16,
    fontSize: 40,
    fontFamily: 'PlayfairDisplay-Italic'
  },
  inputs: {
    width: '80%'
  },
  input: {
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 8,
    fontSize: 20,
    borderColor: '#000',
    borderBottomWidth: 1,
    padding: 8
  },
  error: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    color: '#f00',
    height: 24
  },
  backButtonSpacer: {
    width: '80%',
    height: 48,
    marginTop: 96
  }
});

export default ResetPasswordScreen;
