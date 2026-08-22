import React from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const SignUpLoginScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Image source={require('../../../assets/cannabis.png')} style={styles.logo} />
    <Text style={styles.title}>cannasseur</Text>
    <TouchableOpacity
      style={[styles.button, { backgroundColor: '#000', marginTop: 32 }]}
      onPress={() => navigation.navigate('SignUp')}
    >
      <Text style={[styles.buttonText, { color: '#fff' }]}>SIGN UP</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.button, { marginTop: 16 }]}
      onPress={() => navigation.navigate('Login')}
    >
      <Text style={styles.buttonText}>LOG IN</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.forgotPasswordButton, { marginTop: 120 }]}
      onPress={() => navigation.navigate('ForgotPassword')}
    >
      <Text style={styles.buttonText}>FORGOT PASSWORD?</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F3EF'
  },
  logo: {
    width: 150,
    height: 150,
    // bottom: 16
  },
  title: {
    // bottom: 16,
    fontSize: 40,
    fontFamily: 'PlayfairDisplay-Italic'
  },
  // bottom: {
  //   height: '50%',
  //   zIndex: 200,
  //   backgroundColor: '#FFF'
  // },
  button: {
    borderRadius: 8,
    borderWidth: 1,
    width: '80%',
    // left: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48
  },
  forgotPasswordButton: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48
  }
});
export default SignUpLoginScreen;
