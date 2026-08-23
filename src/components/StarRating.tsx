import React from 'react';
import { Pressable, View, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Local replacement for `react-native-star-rating`, which is frozen at 2018 code
// and depends on `react-native-vector-icons` — a native module Expo Go does not
// bundle. Prop names match the old library so call sites did not have to change.
// Size still comes from `starStyle.fontSize`, as it did before.

const DEFAULT_SIZE = 24;

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export interface StarRatingProps {
  rating?: number;
  maxStars?: number;
  disabled?: boolean;
  selectedStar?: (position: number) => void;
  starStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fullStar?: IconName;
  emptyStar?: IconName;
  fullStarColor?: string;
  emptyStarColor?: string;
  // Mood/medical ratings are optional (0 = not rated), so tapping the
  // current rating again clears it. The final 1-5 rating is required, so
  // it stays plain tap-to-set.
  allowClear?: boolean;
}

const StarRating = ({
  rating = 0,
  maxStars = 5,
  disabled = false,
  selectedStar,
  starStyle,
  containerStyle,
  fullStar = 'star',
  emptyStar = 'star-outline',
  fullStarColor = '#000',
  emptyStarColor = '#d8d8d8',
  allowClear = false
}: StarRatingProps) => {
  const flattened = StyleSheet.flatten(starStyle) || {};
  const size = flattened.fontSize || DEFAULT_SIZE;

  return (
    <View style={[styles.container, containerStyle]}>
      {Array.from({ length: maxStars }, (_, index) => {
        const position = index + 1;
        const isFilled = position <= rating;

        return (
          <Pressable
            key={position}
            disabled={disabled}
            hitSlop={4}
            onPress={() =>
              selectedStar && selectedStar(allowClear && position === rating ? 0 : position)
            }
          >
            <Ionicons
              name={isFilled ? fullStar : emptyStar}
              size={size}
              color={isFilled ? fullStarColor : emptyStarColor}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
});

export default StarRating;
