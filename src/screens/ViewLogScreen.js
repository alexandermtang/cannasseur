import React from 'react';
import { Text, TouchableOpacity, ScrollView, StyleSheet, View } from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import StarRating from 'react-native-star-rating';

import CircleRating from '../components/CircleRating';

class ViewLogScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: moment(navigation.state.params.log.date).format('MM/DD'),
      headerLeft: (
        <TouchableOpacity style={{ left: 16 }} onPress={() => navigation.goBack()}>
          <Ionicons name={'ios-arrow-dropleft'} size={32} />
        </TouchableOpacity>
      )
    };
  };

  state = {
    ratingsType: 'mood' // or 'medical'
  };

  render() {
    const log = this.props.navigation.getParam('log', {});

    return (
      <ScrollView style={styles.container}>
        <View style={styles.strainContainer}>
          <Text style={styles.strain}>{log.strain}</Text>
        </View>
        <View style={styles.finalRatingContainer}>
          <Text style={styles.label}>FINAL RATING</Text>
          <StarRating
            disabled={true}
            maxStars={5}
            starStyle={{ fontSize: 32 }}
            containerStyle={{ padding: 8, height: 48, width: '100%' }}
            rating={log.finalRating}
          />
        </View>
        <View style={styles.line} />
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>TYPE</Text>
          <Text style={styles.type}>{log.type}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.ratingsTypeContainer}>
          <TouchableOpacity
            style={styles.half}
            onPress={() => {
              this.setState({ ratingsType: 'mood' });
            }}
          >
            <Text
              style={[
                styles.label,
                { color: this.state.ratingsType === 'mood' ? '#000' : '#9B9B9B' }
              ]}
            >
              MOOD
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.half}
            onPress={() => {
              this.setState({ ratingsType: 'medical' });
            }}
          >
            <Text
              style={[
                styles.label,
                { color: this.state.ratingsType === 'medical' ? '#000' : '#9B9B9B' }
              ]}
            >
              MEDICAL
            </Text>
          </TouchableOpacity>
        </View>
        {this.state.ratingsType === 'mood' && (
          <View style={styles.ratingsContainer}>
            <View style={styles.left}>
              <Text style={styles.rating}>Happy</Text>
              <Text style={styles.rating}>Creative</Text>
              <Text style={styles.rating}>Active</Text>
              <Text style={styles.rating}>Relaxed</Text>
              <Text style={styles.rating}>Hungry</Text>
              <Text style={styles.rating}>Sleepy</Text>
            </View>
            <View style={styles.right}>
              <CircleRating disabled={true} rating={log.happy} />
              <CircleRating disabled={true} rating={log.creative} />
              <CircleRating disabled={true} rating={log.active} />
              <CircleRating disabled={true} rating={log.relaxed} />
              <CircleRating disabled={true} rating={log.hungry} />
              <CircleRating disabled={true} rating={log.sleepy} />
            </View>
          </View>
        )}
        {this.state.ratingsType === 'medical' && (
          <View style={styles.ratingsContainer}>
            <View style={styles.left}>
              <Text style={styles.rating}>Anxiety</Text>
              <Text style={styles.rating}>Migraines</Text>
              <Text style={styles.rating}>Cramps</Text>
              <Text style={styles.rating}>Depression</Text>
              <Text style={styles.rating}>Pain</Text>
              <Text style={styles.rating}>Insomnia</Text>
            </View>
            <View style={styles.right}>
              <CircleRating disabled={true} rating={log.anxiety} />
              <CircleRating disabled={true} rating={log.migraines} />
              <CircleRating disabled={true} rating={log.cramps} />
              <CircleRating disabled={true} rating={log.depression} />
              <CircleRating disabled={true} rating={log.pain} />
              <CircleRating disabled={true} rating={log.insomnia} />
            </View>
          </View>
        )}
        {log.tags && <View style={styles.line} />}
        {log.tags && (
          <Text style={[styles.label, { paddingLeft: 16, marginTop: 16 }]}>TAGS</Text>
        )}
        <View style={styles.tagsContainer}>
          {(log.tags || []).map((tag, i) => {
            return (
              <View style={styles.button} key={i}>
                <Text style={styles.buttonText}>{tag}</Text>
              </View>
            );
          })}
        </View>
        {log.notes && <View style={styles.line} />}
        {log.notes && <Text style={styles.notes}>"{log.notes}"</Text>}
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => this.props.navigation.push('LogNewSession', { log })}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>EDIT</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    backgroundColor: '#fff'
  },
  strainContainer: {
    backgroundColor: '#F4F3EF',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 32,
    paddingBottom: 32
  },
  strain: {
    fontSize: 32,
    fontFamily: 'PlayfairDisplay-Regular'
  },
  label: {
    fontSize: 16,
    fontFamily: 'WorkSans'
  },
  finalRatingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    marginLeft: '10%',
    paddingBottom: 24,
    width: '80%'
  },
  ratingsTypeContainer: {
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16,
    display: 'flex',
    flexDirection: 'row'
  },
  left: {
    width: '50%'
  },
  right: {
    width: '50%'
  },
  half: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
    marginRight: 16
  },
  typeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16
  },
  typeText: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    marginLeft: 16,
    marginRight: 32
  },
  type: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular'
  },
  ratingsContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: 16
  },
  rating: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 48,
    color: '#9B9B9B'
  },
  line: {
    marginLeft: '10%',
    width: '80%',
    borderBottomWidth: 1,
    borderColor: '#d8d8d8'
  },
  tagsContainer: {
    marginTop: 16,
    marginBottom: 16,
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%'
  },
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    margin: 4,
    height: 48,
    minWidth: 80
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'WorkSans'
  },
  notes: {
    fontSize: 16,
    fontFamily: 'PlayfairDisplay-Regular',
    paddingLeft: '10%',
    width: '80%',
    marginTop: 16,
    paddingBottom: 32,
    color: '#9B9B9B'
  },
  editButton: {
    left: '10%',
    width: '80%',
    marginBottom: 48,
    backgroundColor: '#000'
  }
});

export default ViewLogScreen;
