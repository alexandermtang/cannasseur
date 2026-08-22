import React from 'react';
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

class SubmitLogScreen extends React.Component {
  state = {
    finalRating: 0,
    notes: '',
    hasError: false
  };

  componentDidMount() {
    const log = (this.props.route.params && this.props.route.params.log) || {};
    this.setState({ ...log });
  }

  async onSubmit() {
    if (!this.isComplete()) {
      return this.setState({ hasError: true });
    }

    const userId = await currentUserId();
    const log = (this.props.route.params && this.props.route.params.log) || {};
    const { finalRating, notes } = this.state;

    const row = toRow(
      { ...log, finalRating, notes, date: this.state.date || moment().format() },
      userId
    );

    // Editing an existing log updates that row; a new session inserts one.
    const { error } = log.id
      ? await supabase
          .from('logs')
          .update(row)
          .eq('id', log.id)
      : await supabase.from('logs').insert(row);

    if (error) {
      console.error(error);
      return this.setState({ hasError: true });
    }

    this.setState({ hasError: false });
    // Home re-fetches on focus, so no forceUpdate param is needed.
    this.props.navigation.navigate('Home');
  }

  isComplete() {
    return this.state.finalRating !== 0;
  }

  render() {
    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.label, this.state.hasError ? styles.error : null]}>
          Final Rating
          {this.state.hasError ? '*' : ''}
        </Text>
        <View style={styles.starRatingContainer}>
          <StarRating
            disabled={false}
            maxStars={5}
            starStyle={{ fontSize: 32 }}
            containerStyle={{ padding: 8, height: 48 }}
            rating={this.state.finalRating}
            selectedStar={rating => this.setState({ finalRating: rating })}
          />
        </View>
        <Text style={styles.label}>Any Other Notes?</Text>
        <Text style={styles.sublabel}>(Optional)</Text>
        <TextInput
          multiline={true}
          numberOfLines={3}
          placeholder={'This strain makes me feel on top of the world!'}
          style={styles.notesInput}
          onChangeText={notes => this.setState({ notes })}
          value={this.state.notes}
        />
        <View style={styles.buttonContainer}>
          <BlackButton onPress={() => this.onSubmit()} text={'SUBMIT'} />
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

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
