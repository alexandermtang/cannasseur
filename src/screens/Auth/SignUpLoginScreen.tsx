import React, { useState } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';

import PrimaryButton from '@/components/PrimaryButton';
import SecondaryButton from '@/components/SecondaryButton';
import TertiaryButton from '@/components/TertiaryButton';
import { consumeAccountDeleted } from '@/lib/accountDeletion';
import type { AuthScreenProps } from '@/types/navigation';

const SignUpLoginScreen = ({ navigation }: AuthScreenProps<'SignUpLogin'>) => {
  const [accountDeleted] = useState(consumeAccountDeleted);

  return (
    <View style={styles.container}>
      <Image source={require('@assets/cannabis.png')} style={styles.logo} />
      <Text style={styles.title}>cannasseur</Text>
      {accountDeleted && <Text style={styles.accountDeleted}>{'Account Deleted.'}</Text>}
      <PrimaryButton
        style={styles.signUpButton}
        text={'SIGN UP'}
        onPress={() => navigation.navigate('SignUp')}
      />
      <SecondaryButton
        style={styles.logInButton}
        text={'LOG IN'}
        onPress={() => navigation.navigate('Login')}
      />
      <TertiaryButton
        style={styles.forgotPasswordButton}
        text={'FORGOT PASSWORD?'}
        onPress={() => navigation.navigate('ForgotPassword')}
      />
    </View>
  );
};

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
  accountDeleted: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    marginTop: 16
  },
  signUpButton: {
    borderWidth: 1,
    marginTop: 32
  },
  logInButton: {
    marginTop: 16
  },
  forgotPasswordButton: {
    marginTop: 120
  }
});
export default SignUpLoginScreen;
