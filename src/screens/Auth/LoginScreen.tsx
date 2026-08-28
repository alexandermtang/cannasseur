import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { Ionicons } from '@expo/vector-icons';

import PrimaryButton from '@/components/PrimaryButton';
import TertiaryButton from '@/components/TertiaryButton';
import { supabase } from '@/lib/supabase';
import type { AuthScreenProps } from '@/types/navigation';

const LoginScreen = ({ navigation }: AuthScreenProps<'Login'>) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onPress = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent={'Logging in...'}
        textStyle={{ color: '#FFF', fontFamily: 'PlayfairDisplay-Regular' }}
      />
      <Image source={require('@assets/cannabis.png')} style={styles.logo} />
      <Text style={styles.title}>cannasseur</Text>
      <View style={styles.inputs}>
        <TextInput
          autoCapitalize={'none'}
          placeholder={'email'}
          onChangeText={email => {
            setEmail(email);
            setError('');
          }}
          style={styles.input}
        />
        <View>
          <TextInput
            autoCapitalize={'none'}
            placeholder={'password'}
            value={password}
            onChangeText={password => {
              setPassword(password);
              setError('');
            }}
            style={[styles.input, styles.passwordInput]}
            secureTextEntry={!passwordVisible}
          />
          <TouchableOpacity
            onPress={() => setPasswordVisible(visible => !visible)}
            hitSlop={12}
            style={styles.passwordToggle}
          >
            <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={24} />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.error}>{error}</Text>
      <PrimaryButton
        text={'LOG IN'}
        onPress={() => {
          setIsLoading(true);
          onPress();
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
  border: {
    borderColor: '#000',
    borderWidth: 2,
    height: '90%',
    width: '90%',
    position: 'absolute',
    zIndex: 100,
    left: '5%',
    top: '5%'
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
  passwordInput: {
    paddingRight: 36
  },
  passwordToggle: {
    position: 'absolute',
    top: 0,
    bottom: 8,
    right: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  error: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    color: '#f00',
    height: 24
  },
  backButton: {
    marginTop: 89
  }
});

export default LoginScreen;
