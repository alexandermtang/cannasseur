import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import moment from 'moment';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';

import StarRating from './StarRating';
import type { Log } from '../types/log';

const DELETE_WIDTH = 96;

interface ListItemProps {
  item: Log;
  onPress: () => void;
  onPressDelete: () => void;
}

const ListItem = ({ item, onPress, onPressDelete }: ListItemProps) => {
  const date = moment(item.date).format('MM/DD');
  const strain = item.strain.length > 22 ? `${item.strain.slice(0, 22)}...` : item.strain;

  const renderRightActions = (
    _progress: SharedValue<number>,
    _translation: SharedValue<number>,
    swipeable: SwipeableMethods
  ) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => {
        swipeable.close();
        onPressDelete();
      }}
    >
      <Text style={styles.deleteText}>DELETE</Text>
    </TouchableOpacity>
  );

  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={DELETE_WIDTH / 2}
      renderRightActions={renderRightActions}
    >
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <Text style={styles.text}>{`${date}\t${strain}`}</Text>
        <StarRating
          disabled={true}
          rating={item.finalRating}
          starStyle={{ fontSize: 16 }}
          containerStyle={{ paddingRight: 16, width: '30%' }}
        />
      </TouchableOpacity>
    </ReanimatedSwipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    backgroundColor: '#FFF',
    borderColor: '#d8d8d8',
    borderBottomWidth: 1
  },
  text: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular'
  },
  deleteButton: {
    width: DELETE_WIDTH,
    height: 56,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteText: {
    color: '#fff',
    fontFamily: 'WorkSans',
    fontSize: 16
  }
});

export default ListItem;
