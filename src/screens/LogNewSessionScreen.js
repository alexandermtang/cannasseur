import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, TextInput, StyleSheet, ScrollView } from 'react-native';
import moment from 'moment';
import Dialog from 'react-native-dialog';

import CircleRating from '../components/CircleRating';
import BlackButton from '../components/BlackButton';
import HeaderButton from '../components/HeaderButton';
import { supabase, currentUserId } from '../lib/supabase';

const DEFAULT_TAGS = ['Laughing', 'Socializing', 'Yoga', 'Munchies', 'Movies', 'Ideas'];

export const logNewSessionScreenOptions = ({ navigation }) => ({
  title: moment().format('MM/DD'),
  headerLeft: () => (
    <HeaderButton name={'chevron-back-circle-outline'} onPress={() => navigation.goBack()} />
  )
});

const LogNewSessionScreen = ({ navigation, route }) => {
  const log = (route.params && route.params.log) || null;

  const [strain, setStrain] = useState(log ? log.strain : '');
  const [type, setType] = useState(log ? log.type : 'Flower'); // or 'Concentrate'

  const [happy, setHappy] = useState(log ? log.happy : 0);
  const [creative, setCreative] = useState(log ? log.creative : 0);
  const [active, setActive] = useState(log ? log.active : 0);
  const [relaxed, setRelaxed] = useState(log ? log.relaxed : 0);
  const [sleepy, setSleepy] = useState(log ? log.sleepy : 0);

  const [anxiety, setAnxiety] = useState(log ? log.anxiety : 0);
  const [migraines, setMigraines] = useState(log ? log.migraines : 0);
  const [depression, setDepression] = useState(log ? log.depression : 0);
  const [pain, setPain] = useState(log ? log.pain : 0);
  const [insomnia, setInsomnia] = useState(log ? log.insomnia : 0);

  const [tags, setTags] = useState(log ? log.tags : []);
  const [tagOptions, setTagOptions] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [hasErrors, setHasErrors] = useState(false);

  const [ratingsType, setRatingsType] = useState('mood'); // or 'medical'

  useEffect(() => {
    (async () => {
      const userId = await currentUserId();
      if (!userId) {
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('tags')
        .eq('id', userId)
        .single();

      if (error) {
        return console.error(error);
      }

      // A profile with no tags yet gets the original starter set.
      const nextTagOptions = data && data.tags && data.tags.length > 0 ? data.tags : DEFAULT_TAGS;
      setTagOptions(nextTagOptions);
    })();
  }, []);

  const toggleTag = tag => {
    const newTags = tags.indexOf(tag) === -1 ? [...tags, tag] : tags.filter(t => t !== tag);
    setTags(newTags);
  };

  const isComplete = () => strain !== '';

  // Takes the tags explicitly: callers used to fire this straight after
  // setState and read back this.state, which races with React's batching.
  const updateTags = async tagOptions => {
    const userId = await currentUserId();
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ tags: tagOptions })
      .eq('id', userId);

    if (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.nameOfStrainContainer}>
        <Text style={[styles.nameOfStrain, hasErrors ? styles.error : null]}>
          NAME OF STRAIN
          {hasErrors ? '*' : ''}
        </Text>
        <TextInput
          style={styles.strainInput}
          placeholder={'Pineapple Express'}
          onChangeText={strain => setStrain(strain)}
          value={strain}
        />
      </View>
      <View style={styles.typeContainer}>
        <Text style={styles.typeText}>TYPE</Text>
        <TouchableOpacity onPress={() => setType('Flower')}>
          <Text style={[styles.type, { color: type === 'Flower' ? '#000' : '#9B9B9B' }]}>
            Flower
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setType('Concentrate')}>
          <Text style={[styles.type, { color: type === 'Concentrate' ? '#000' : '#9B9B9B' }]}>
            Concentrate
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ratingsTypeContainer}>
        <TouchableOpacity
          style={styles.half}
          onPress={() => {
            setRatingsType('mood');
          }}
        >
          <Text style={[styles.label, { color: ratingsType === 'mood' ? '#000' : '#9B9B9B' }]}>
            MOOD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.half}
          onPress={() => {
            setRatingsType('medical');
          }}
        >
          <Text style={[styles.label, { color: ratingsType === 'medical' ? '#000' : '#9B9B9B' }]}>
            MEDICAL
          </Text>
        </TouchableOpacity>
      </View>
      {ratingsType === 'mood' && (
        <View style={styles.ratingsContainer}>
          <View style={styles.left}>
            <Text style={styles.rating}>Happy</Text>
            <Text style={styles.rating}>Creative</Text>
            <Text style={styles.rating}>Active</Text>
            <Text style={styles.rating}>Relaxed</Text>
            <Text style={styles.rating}>Sleepy</Text>
          </View>
          <View style={styles.right}>
            <CircleRating rating={happy} selectedStar={rating => setHappy(rating)} />
            <CircleRating rating={creative} selectedStar={rating => setCreative(rating)} />
            <CircleRating rating={active} selectedStar={rating => setActive(rating)} />
            <CircleRating rating={relaxed} selectedStar={rating => setRelaxed(rating)} />
            <CircleRating rating={sleepy} selectedStar={rating => setSleepy(rating)} />
          </View>
        </View>
      )}
      {ratingsType === 'medical' && (
        <View style={styles.ratingsContainer}>
          <View style={styles.left}>
            <Text style={styles.rating}>Anxiety</Text>
            <Text style={styles.rating}>Migraines</Text>
            <Text style={styles.rating}>Depression</Text>
            <Text style={styles.rating}>Pain</Text>
            <Text style={styles.rating}>Insomnia</Text>
          </View>
          <View style={styles.right}>
            <CircleRating rating={anxiety} selectedStar={rating => setAnxiety(rating)} />
            <CircleRating rating={migraines} selectedStar={rating => setMigraines(rating)} />
            <CircleRating rating={depression} selectedStar={rating => setDepression(rating)} />
            <CircleRating rating={pain} selectedStar={rating => setPain(rating)} />
            <CircleRating rating={insomnia} selectedStar={rating => setInsomnia(rating)} />
          </View>
        </View>
      )}
      <Text style={styles.label}>TAGS</Text>
      <View style={styles.tagsContainer}>
        {tagOptions.map((tag, i) => {
          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.tagButton,
                tags.indexOf(tag) === -1 ? styles.tagButtonUnhighlighted : styles.tagButtonHighlighted
              ]}
              onPress={() => toggleTag(tag)}
              onLongPress={() => {
                const nextTagOptions = tagOptions.filter(t => t !== tag);
                setTagOptions(nextTagOptions);
                updateTags(nextTagOptions);
              }}
            >
              <Text
                style={[
                  styles.tag,
                  tags.indexOf(tag) === -1 ? styles.tagUnhighlighted : styles.tagHighlighted
                ]}
              >
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity style={[styles.tagButton]} onPress={() => setDialogVisible(true)}>
          <Text style={[styles.tag]}>+ ADD</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.nextButtonContainer}>
        <BlackButton
          text={'NEXT'}
          onPress={() => {
            if (isComplete()) {
              // Spread the original log first so passthrough fields not
              // tracked in local state (id, date, finalRating, notes) survive
              // the edit — that id is what lets SubmitLog update in place.
              navigation.navigate('SubmitLog', {
                log: {
                  ...(log || {}),
                  strain,
                  type,
                  happy,
                  creative,
                  active,
                  relaxed,
                  sleepy,
                  anxiety,
                  migraines,
                  depression,
                  pain,
                  insomnia,
                  tags,
                  tagOptions,
                  dialogVisible,
                  newTag,
                  hasErrors,
                  ratingsType
                }
              });
              setHasErrors(false);
            } else {
              setHasErrors(true);
            }
          }}
        />
      </View>
      <Dialog.Container visible={dialogVisible}>
        <Dialog.Title>Enter a tag</Dialog.Title>
        <Dialog.Input onChangeText={newTag => setNewTag(newTag)} />
        <Dialog.Button label="Cancel" onPress={() => setDialogVisible(false)} />
        <Dialog.Button
          label="OK"
          onPress={() => {
            const nextTags = newTag && !tagOptions.includes(newTag) ? [...tagOptions, newTag] : tagOptions;

            setTagOptions(nextTags);
            setNewTag('');
            setDialogVisible(false);
            updateTags(nextTags);
          }}
        />
      </Dialog.Container>
    </ScrollView>
  );
};

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
