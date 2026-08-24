import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import Spinner from 'react-native-loading-spinner-overlay';

import { supabase } from '../../lib/supabase';
import type { AuthScreenProps } from '../../types/navigation';

const SignUpScreen = ({ navigation }: AuthScreenProps<'SignUp'>) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isOver21, setIsOver21] = useState(false);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSignUp = async () => {
    if (name === '') {
      setError('Missing name.');
      setIsLoading(false);
      return;
    }

    if (email === '') {
      setError('Missing email.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords must match.');
      setIsLoading(false);
      return;
    }

    if (!isOver21) {
      setError('Please verify your age.');
      setIsLoading(false);
      return;
    }

    // The `name` lands in raw_user_meta_data; the on_auth_user_created trigger
    // copies it into the profiles row, so there is no manual profile write here.
    // Email confirmation is off for this project, so signUp returns a session
    // immediately - onAuthStateChange in App.tsx swaps the stack from there.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Spinner
        visible={isLoading}
        textContent={'Creating account...'}
        textStyle={{ color: '#FFF', fontFamily: 'PlayfairDisplay-Regular' }}
      />
      <TextInput
        style={styles.input}
        placeholder={'name'}
        onChangeText={name => {
          setName(name);
          setError('');
        }}
        autoCapitalize={'none'}
      />
      <TextInput
        style={styles.input}
        placeholder={'email'}
        onChangeText={email => {
          setEmail(email);
          setError('');
        }}
        autoCapitalize={'none'}
      />
      <TextInput
        style={styles.input}
        placeholder={'password'}
        onChangeText={password => {
          setPassword(password);
          setError('');
        }}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder={'confirm password'}
        onChangeText={confirmPassword => {
          setConfirmPassword(confirmPassword);
          setError('');
        }}
        secureTextEntry
      />
      <View style={styles.isOver21Container}>
        <Checkbox
          value={isOver21}
          onValueChange={() => {
            setIsOver21(!isOver21);
            setError('');
          }}
          color={isOver21 ? '#000' : undefined}
          style={{ marginRight: 16, width: 28, height: 28 }}
        />
        <TouchableOpacity
          onPress={() => {
            setIsOver21(!isOver21);
            setError('');
          }}
        >
          <Text style={{ fontFamily: 'WorkSans', fontSize: 16 }}>I am over the age of 21.</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity
        style={[styles.button, styles.signUpButton]}
        onPress={() => {
          setIsLoading(true);
          onSignUp();
        }}
      >
        <Text style={[styles.buttonText, { color: '#fff' }]}>CREATE ACCOUNT</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, { marginTop: 80 }]} onPress={() => navigation.goBack()}>
        <Text style={[styles.buttonText, { color: '#000' }]}>GO BACK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#F4F3EF'
  },
  input: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular',
    borderBottomWidth: 1,
    padding: 8,
    marginTop: 16,
    width: '80%'
  },
  button: {
    width: '80%',
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  signUpButton: {
    backgroundColor: '#000',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8
  },
  error: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    color: '#f00',
    height: 24,
    marginTop: 8
  },
  isOver21Container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginTop: 16
  },
  buttonText: {
    fontFamily: 'WorkSans',
    fontSize: 16
  }
});

export default SignUpScreen;
