import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface BlackButtonProps extends TouchableOpacityProps {
  text: string;
}

const BlackButton = (props: BlackButtonProps) => (
  <TouchableOpacity {...props} style={styles.button}>
    <Text style={styles.buttonText}>{props.text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  buttonText: {
    color: '#FFF',
    fontFamily: 'WorkSans',
    fontSize: 16
  }
});

export default BlackButton;
