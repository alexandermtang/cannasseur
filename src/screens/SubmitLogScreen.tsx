import React, { useState } from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';
import moment from 'moment';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import StarRating from '../components/StarRating';
import BlackButton from '../components/BlackButton';
import HeaderButton from '../components/HeaderButton';
import { supabase, currentUserId } from '../lib/supabase';
import { toRow } from '../lib/logs';
import type { Log } from '../types/log';
import type { AppScreenProps } from '../types/navigation';

export const submitLogScreenOptions = ({
  navigation,
  route
}: AppScreenProps<'SubmitLog'>): NativeStackNavigationOptions => ({
  // Editing an existing log shows its own date; moment(undefined) falls back
  // to today, which is correct for a brand new session.
  title: moment(route.params?.log?.date).format('MM/DD/YYYY'),
  headerLeft: () => (
    <HeaderButton name={'chevron-back'} onPress={() => navigation.goBack()} />
  )
});

const SubmitLogScreen = ({ navigation, route }: AppScreenProps<'SubmitLog'>) => {
  const initialLog = (route.params && route.params.log) || undefined;

  const [finalRating, setFinalRating] = useState(initialLog?.finalRating ?? 0);
  const [notes, setNotes] = useState(initialLog?.notes ?? '');
  const [hasError, setHasError] = useState(false);
  const [date, setDate] = useState(initialLog?.date);

  const isComplete = () => finalRating !== 0;

  const onSubmit = async () => {
    if (!isComplete()) {
      setHasError(true);
      return;
    }

    const userId = await currentUserId();
    const log = (route.params && route.params.log) || ({} as Log);

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
    // Reset (not navigate) so LogNewSession/SubmitLog are dropped from the
    // stack — otherwise Home gets pushed on top and back just walks through
    // duplicate date-titled screens instead of leaving the log book.
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
