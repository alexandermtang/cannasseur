import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface SecondaryButtonProps extends TouchableOpacityProps {
  text: string;
}

// Outlined, unfilled — the alternative to whatever the PrimaryButton on the
// same screen does (LOG IN next to SIGN UP).
const SecondaryButton = ({ text, style, ...props }: SecondaryButtonProps) => (
  <TouchableOpacity {...props} style={[styles.button, style]}>
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: '80%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1
  },
  text: {
    color: '#000',
    fontFamily: 'WorkSans',
    fontSize: 16
  }
});

export default SecondaryButton;
