import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

import { supabase } from '../../lib/supabase';

class LoginScreen extends React.Component {
  state = {
    email: '',
    password: '',
    error: '',
    isLoading: false
  };

  async onPress() {
    const { email, password } = this.state;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      this.setState({ error: 'Invalid email or password.', isLoading: false });
      return;
    }

    // No navigate() here: onAuthStateChange in App.js swaps the stack.
    this.setState({ isLoading: false });
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner
          visible={this.state.isLoading}
          textContent={'Logging in...'}
          textStyle={{ color: '#FFF', fontFamily: 'PlayfairDisplay-Regular' }}
        />
        <Image source={require('../../../assets/cannabis.png')} style={styles.logo} />
        <Text style={styles.title}>cannasseur</Text>
        <View style={styles.inputs}>
          <TextInput
            autoCapitalize={'none'}
            placeholder={'email'}
            onChangeText={email => this.setState({ email, error: '' })}
            style={styles.input}
          />
          <TextInput
            autoCapitalize={'none'}
            placeholder={'password'}
            onChangeText={password => this.setState({ password, error: '' })}
            style={styles.input}
            secureTextEntry
          />
        </View>
        <Text style={styles.error}>{this.state.error}</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => {
            this.setState({ isLoading: true });
            this.onPress();
          }}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>LOG IN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => this.props.navigation.goBack()}>
          <Text style={[styles.buttonText, { color: '#000' }]}>GO BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

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
  error: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    color: '#f00',
    height: 24
  },
  loginButton: {
    width: '80%',
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#000'
  },
  buttonText: {
    fontFamily: 'WorkSans',
    fontSize: 16
  },
  backButton: {
    width: '80%',
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 96
  }
});

export default LoginScreen;
