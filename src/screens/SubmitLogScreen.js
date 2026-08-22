import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import StarRating from '../components/StarRating';
import BlackButton from '../components/BlackButton';
import HeaderButton from '../components/HeaderButton';
import { supabase, currentUserId } from '../lib/supabase';
import { toRow } from '../lib/logs';

export const submitLogScreenOptions = ({ navigation }) => ({
  title: moment().format('MM/DD'),
  headerLeft: () => (
    <HeaderButton name={'chevron-back-circle-outline'} onPress={() => navigation.goBack()} />
  )
});

const SubmitLogScreen = ({ navigation, route }) => {
  const [finalRating, setFinalRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [hasError, setHasError] = useState(false);
  const [date, setDate] = useState(undefined);

  useEffect(() => {
    const log = (route.params && route.params.log) || {};
    if (log.finalRating !== undefined) {
      setFinalRating(log.finalRating);
    }
    if (log.notes !== undefined) {
      setNotes(log.notes);
    }
    if (log.date !== undefined) {
      setDate(log.date);
    }
  }, []);

  const isComplete = () => finalRating !== 0;

  const onSubmit = async () => {
    if (!isComplete()) {
      setHasError(true);
      return;
    }

    const userId = await currentUserId();
    const log = (route.params && route.params.log) || {};

    const row = toRow({ ...log, finalRating, notes, date: date || moment().format() }, userId);

    // Editing an existing log updates that row; a new session inserts one.
    const { error } = log.id
      ? await supabase
          .from('logs')
          .update(row)
          .eq('id', log.id)
      : await supabase.from('logs').insert(row);

    if (error) {
      console.error(error);
      setHasError(true);
      return;
    }

    setHasError(false);
    // Home re-fetches on focus, so no forceUpdate param is needed.
    navigation.navigate('Home');
  };

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.label, hasError ? styles.error : null]}>
        Final Rating
        {hasError ? '*' : ''}
      </Text>
      <View style={styles.starRatingContainer}>
        <StarRating
          disabled={false}
          maxStars={5}
          starStyle={{ fontSize: 32 }}
          containerStyle={{ padding: 8, height: 48 }}
          rating={finalRating}
          selectedStar={rating => setFinalRating(rating)}
        />
      </View>
      <Text style={styles.label}>Any Other Notes?</Text>
      <Text style={styles.sublabel}>(Optional)</Text>
      <TextInput
        multiline={true}
        numberOfLines={3}
        placeholder={'This strain makes me feel on top of the world!'}
        style={styles.notesInput}
        onChangeText={notes => setNotes(notes)}
        value={notes}
      />
      <View style={styles.buttonContainer}>
        <BlackButton onPress={() => onSubmit()} text={'SUBMIT'} />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    height: '100%'
  },
  label: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular'
  },
  error: {
    color: '#f00'
  },
  sublabel: {
    marginTop: 8,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular'
  },
  starRatingContainer: {
    marginTop: 24,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderColor: '#d8d8d8'
  },
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
  },
  notesInput: {
    borderWidth: 1,
    marginTop: 24,
    marginBottom: 24,
    borderRadius: 8,
    height: 72,
    padding: 16,
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular'
  },
  buttonContainer: {
    paddingLeft: 16,
    paddingRight: 16
  }
});

export default SubmitLogScreen;
