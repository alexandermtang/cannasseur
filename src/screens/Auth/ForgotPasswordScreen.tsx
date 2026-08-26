import React, { useState } from 'react';
import { Text, View, Image, StyleSheet, TextInput } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

import PrimaryButton from '../../components/PrimaryButton';
import TertiaryButton from '../../components/TertiaryButton';
import { supabase } from '../../lib/supabase';
import type { AuthScreenProps } from '../../types/navigation';

const ForgotPasswordScreen = ({ navigation }: AuthScreenProps<'ForgotPassword'>) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onResetPassword = async () => {
    if (email === '') {
      setError('Missing email.');
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.cannasseur.app/reset-password'
    });

    if (error) {
      setError('Invalid email.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    setNotice('Please check your email.');
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent={'Sending reset password email...'}
        textStyle={{ color: '#FFF', fontFamily: 'PlayfairDisplay-Regular' }}
      />
      <Image source={require('../../../assets/cannabis.png')} style={styles.logo} />
      <Text style={styles.title}>cannasseur</Text>
      <TextInput
        autoCapitalize={'none'}
        placeholder={'email'}
        onChangeText={email => {
          setEmail(email);
          setError('');
          setNotice('');
        }}
        style={styles.input}
      />
      <Text style={error ? styles.error : styles.notice}>{error || notice}</Text>
      <PrimaryButton
        style={styles.resetPasswordButton}
        text={'RESET PASSWORD'}
        onPress={() => {
          setIsLoading(true);
          onResetPassword();
        }}
      />
      <TertiaryButton
        style={styles.backButton}
        text={'GO BACK'}
        onPress={() => navigation.goBack()}
      />
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
  input: {
    fontFamily: 'PlayfairDisplay-Regular',
    marginBottom: 8,
    fontSize: 20,
    borderColor: '#000',
    borderBottomWidth: 1,
    padding: 8,
    width: '80%'
  },
  error: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    color: '#f00',
    height: 24
  },
  notice: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    color: '#000',
    height: 24
  },
  resetPasswordButton: {
    marginTop: 4
  },
  backButton: {
    marginTop: 136
  }
});

export default ForgotPasswordScreen;
