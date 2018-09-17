import React from 'react';
import { Text, TouchableOpacity, View, TextInput, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

import CircleRating from '../components/CircleRating';
import BlackButton from '../components/BlackButton';

class LogNewSessionScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: moment().format('MM/DD'),
      headerLeft: (
        <TouchableOpacity style={{ left: 16 }} onPress={() => navigation.goBack()}>
          <Ionicons name={'ios-arrow-dropleft'} size={32} />
        </TouchableOpacity>
      )
    };
  };

  state = {
    strain: '',
    type: 'Flower', // or 'Concentrate'

    happy: 0,
    creative: 0,
    active: 0,
    relaxed: 0,
    hungry: 0,
    sleepy: 0,

    anxiety: 0,
    migraines: 0,
    cramps: 0,
    depression: 0,
    pain: 0,
    insomnia: 0,

    tags: [],
    tagOptions: [
      'Ideas',
      'Laughing',
      'Movies',
      'Socializing',
      'Sleep',
      'Sex',
      'Edibles',
      'Food',
      'Anxiety'
    ],
    hasErrors: false,

    ratingsType: 'mood' // or 'medical'
  };

  componentDidMount() {
    const log = this.props.navigation.getParam('log', null);
    if (log) {
      this.setState({ ...log });
    }
  }

  toggleTag(tag) {
    const { tags } = this.state;
    const newTags = tags.indexOf(tag) === -1 ? [...tags, tag] : tags.filter(t => t !== tag);
    this.setState({ tags: newTags });
  }

  isComplete() {
    return this.state.strain !== '';
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.nameOfStrainContainer}>
          <Text style={[styles.nameOfStrain, this.state.hasErrors ? styles.error : null]}>
            NAME OF STRAIN
            {this.state.hasErrors ? '*' : ''}
          </Text>
          <TextInput
            style={styles.strainInput}
            placeholder={'Pineapple Express'}
            onChangeText={strain => this.setState({ strain })}
            value={this.state.strain}
          />
        </View>
        <View style={styles.typeContainer}>
          <Text style={styles.typeText}>TYPE</Text>
          <TouchableOpacity onPress={() => this.setState({ type: 'Flower' })}>
            <Text
              style={[styles.type, { color: this.state.type === 'Flower' ? '#000' : '#9B9B9B' }]}
            >
              Flower
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.setState({ type: 'Concentrate' })}>
            <Text
              style={[
                styles.type,
                { color: this.state.type === 'Concentrate' ? '#000' : '#9B9B9B' }
              ]}
            >
              Concentrate
            </Text>
          </TouchableOpacity>
        </View>

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
              <CircleRating
                rating={this.state.happy}
                selectedStar={rating => this.setState({ happy: rating })}
              />
              <CircleRating
                rating={this.state.creative}
                selectedStar={rating => this.setState({ creative: rating })}
              />
              <CircleRating
                rating={this.state.active}
                selectedStar={rating => this.setState({ active: rating })}
              />
              <CircleRating
                rating={this.state.relaxed}
                selectedStar={rating => this.setState({ relaxed: rating })}
              />
              <CircleRating
                rating={this.state.hungry}
                selectedStar={rating => this.setState({ hungry: rating })}
              />
              <CircleRating
                rating={this.state.sleepy}
                selectedStar={rating => this.setState({ sleepy: rating })}
              />
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
              <CircleRating
                rating={this.state.anxiety}
                selectedStar={rating => this.setState({ anxiety: rating })}
              />
              <CircleRating
                rating={this.state.migraines}
                selectedStar={rating => this.setState({ migraines: rating })}
              />
              <CircleRating
                rating={this.state.cramps}
                selectedStar={rating => this.setState({ cramps: rating })}
              />
              <CircleRating
                rating={this.state.depression}
                selectedStar={rating => this.setState({ depression: rating })}
              />
              <CircleRating
                rating={this.state.pain}
                selectedStar={rating => this.setState({ pain: rating })}
              />
              <CircleRating
                rating={this.state.insomnia}
                selectedStar={rating => this.setState({ insomnia: rating })}
              />
            </View>
          </View>
        )}
        <Text style={styles.label}>TAGS</Text>
        <View style={styles.tagsContainer}>
          {this.state.tagOptions.map((tag, i) => {
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.tagButton,
                  this.state.tags.indexOf(tag) === -1
                    ? styles.tagButtonUnhighlighted
                    : styles.tagButtonHighlighted
                ]}
                onPress={() => this.toggleTag(tag)}
              >
                <Text
                  style={[
                    styles.tag,
                    this.state.tags.indexOf(tag) === -1
                      ? styles.tagUnhighlighted
                      : styles.tagHighlighted
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.nextButtonContainer}>
          <BlackButton
            text={'NEXT'}
            onPress={() => {
              if (this.isComplete()) {
                this.props.navigation.navigate('SubmitLog', { log: this.state });
                this.setState({ hasErrors: false });
              } else {
                this.setState({ hasErrors: true });
              }
            }}
          />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    height: '100%'
  },
  nameOfStrainContainer: {},
  strainInput: {
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular',
    borderColor: '#9B9B9B',
    borderBottomWidth: 1
  },
  typeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16
  },
  typeText: {
    fontFamily: 'WorkSans',
    fontSize: 16,
    marginRight: 48
  },
  type: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 24,
    marginRight: 41
  },
  ratingsTypeContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8
  },
  label: {
    fontSize: 16,
    fontFamily: 'WorkSans'
  },
  half: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
    marginRight: 16
  },
  ratingsContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 16
  },
  left: {
    width: '50%'
  },
  right: {
    width: '50%'
  },
  nameOfStrain: {
    fontSize: 16,
    fontFamily: 'WorkSans'
  },
  error: {
    color: '#f00'
    // fontFamily: 'WorkSans-Bold'
  },
  rating: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular',
    lineHeight: 48,
    color: '#9B9B9B'
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%'
  },
  tagButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    margin: 4,
    height: 48,
    minWidth: 80
  },
  tagButtonUnhighlighted: {
    borderColor: '#9b9b9b'
  },
  tagButtonHighlighted: {
    backgroundColor: '#000',
    borderColor: '#000'
  },
  tag: {
    fontSize: 16,
    fontFamily: 'WorkSans'
  },
  tagUnhighlighted: {
    color: '#9b9b9b'
  },
  tagHighlighted: {
    color: '#fff'
  },
  nextButtonContainer: {
    marginTop: 8,
    paddingRight: 16,
    paddingLeft: 16,
    paddingBottom: 48
  }
});

export default LogNewSessionScreen;
