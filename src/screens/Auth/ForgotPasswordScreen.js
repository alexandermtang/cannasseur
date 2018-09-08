import React from 'react';
import { Text, View, Image, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import * as firebase from 'firebase';

class ForgotPasswordScreen extends React.Component {
  state = {
    email: '',
    error: '',
    isLoading: false
  };

  async onResetPassword() {
    const { email } = this.state;
    if (email === '') {
      return this.setState({ error: 'Missing email.', isLoading: false });
    }

    try {
      await firebase.auth().sendPasswordResetEmail(email);
      this.setState({ isLoading: false });
      this.props.navigation.goBack();
    } catch (error) {
      // console.error(error);
      this.setState({ error: 'Invalid email.', isLoading: false });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Spinner
          visible={this.state.isLoading}
          textContent={'Sending reset password email...'}
          textStyle={{ color: '#FFF', fontFamily: 'PlayfairDisplay-Regular' }}
        />
        <Image source={require('../../../assets/cannabis.png')} style={styles.logo} />
        <Text style={styles.title}>cannasseur</Text>
        <TextInput
          autoCapitalize={'none'}
          placeholder={'email'}
          onChangeText={email => this.setState({ email, error: '' })}
          style={styles.input}
        />
        <Text style={styles.error}>{this.state.error}</Text>
        <TouchableOpacity
          style={styles.resetPasswordButton}
          onPress={() => {
            this.setState({ isLoading: true });
            this.onResetPassword();
          }}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>RESET PASSWORD</Text>
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
  resetPasswordButton: {
    width: '80%',
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#000',
    marginTop: 4
  },
  backButton: {
    width: '80%',
    height: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 136
  }
});

export default ForgotPasswordScreen;
