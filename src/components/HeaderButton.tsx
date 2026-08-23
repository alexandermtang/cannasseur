import React from 'react';
import { TouchableOpacity } from 'react-native';
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
  name: React.ComponentProps<typeof Ionicons>['name'];
  size?: number;
  onPress: () => void;
}

const HeaderButton = ({ name, size = ICON_SIZE, onPress }: HeaderButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    hitSlop={12}
    style={{
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    <Ionicons name={name} size={size} />
  </TouchableOpacity>
);

export default HeaderButton;
