import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface PrimaryButtonProps extends TouchableOpacityProps {
  text: string;
}

// The filled black button — the main action on a screen (LOG IN, SUBMIT,
// LOG NEW SESSION). `style` merges over the base so call sites can keep
// their own spacing without redeclaring the button's look.
const PrimaryButton = ({ text, style, ...props }: PrimaryButtonProps) => (
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
    backgroundColor: '#000'
  },
  text: {
    color: '#FFF',
    fontFamily: 'WorkSans',
    fontSize: 16
  }
});

export default PrimaryButton;
