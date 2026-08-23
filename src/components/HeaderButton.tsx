import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// react-navigation 2's header had no padding, so every screen nudged its icon
// with `left: 16` / `right: 16`. native-stack pads the header itself, so those
// offsets are gone — keeping them is what threw the icons out of alignment.

// 32 matches every other icon in the app (search, filter and modal-close in
// HomeScreen). The fixed box gives the icon a predictable button to centre in
// rather than letting it size itself to the text line height.
const ICON_SIZE = 32;
const BUTTON_SIZE = 36;

interface HeaderButtonProps {
  // Either an icon name, or a text label (e.g. a selected year) in its
  // place — never both. The label case grows past BUTTON_SIZE as needed
  // rather than clipping.
  name?: React.ComponentProps<typeof Ionicons>['name'];
  label?: string;
  size?: number;
  onPress: () => void;
}

const HeaderButton = ({ name, label, size = ICON_SIZE, onPress }: HeaderButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    hitSlop={12}
    style={{
      width: label ? undefined : BUTTON_SIZE,
      minWidth: BUTTON_SIZE,
      height: BUTTON_SIZE,
      paddingHorizontal: label ? 4 : 0,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    {label ? (
      <Text style={{ fontSize: 16, fontFamily: 'WorkSans', fontWeight: '600' }}>{label}</Text>
    ) : (
      name && <Ionicons name={name} size={size} />
    )}
  </TouchableOpacity>
);

export default HeaderButton;
