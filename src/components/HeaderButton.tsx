import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ICON_SIZE = 24;
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
