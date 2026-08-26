import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface TertiaryButtonProps extends TouchableOpacityProps {
  text: string;
}

// Text only, no box — the way out of a screen rather than the point of it
// (GO BACK, FORGOT PASSWORD?). Keeps the same 48pt tap target as the other
// two so a screen's buttons stay evenly spaced.
const TertiaryButton = ({ text, style, ...props }: TertiaryButtonProps) => (
  <TouchableOpacity {...props} style={[styles.button, style]}>
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: '80%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#000',
    fontFamily: 'WorkSans',
    fontSize: 16
  }
});

export default TertiaryButton;
