import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Animated,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  ScrollView,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import ListItem from '../components/ListItem';
import BlackButton from '../components/BlackButton';
import HeaderButton from '../components/HeaderButton';
import { supabase, currentUserId } from '../lib/supabase';
import { fromRow } from '../lib/logs';
import type { Log } from '../types/log';
import type { AppScreenProps } from '../types/navigation';

export const homeScreenOptions = ({
  navigation
}: AppScreenProps<'Home'>): NativeStackNavigationOptions => ({
  title: 'LOG BOOK',
  headerRight: () => (
    <HeaderButton name={'person-circle-outline'} onPress={() => navigation.push('Me')} />
  )
});

type SortType =
  | 'mostRecent'
  | 'topRated'
  | 'happy'
  | 'creative'
  | 'active'
  | 'relaxed'
  | 'sleepy'
  | 'anxiety'
  | 'migraines'
  | 'depression'
  | 'pain'
  | 'insomnia';

const MOOD_TYPES = ['happy', 'creative', 'active', 'relaxed', 'sleepy'] as const;
const MEDICAL_TYPES = ['anxiety', 'migraines', 'depression', 'pain', 'insomnia'] as const;

type MoodField = (typeof MOOD_TYPES)[number];
type MedicalField = (typeof MEDICAL_TYPES)[number];

const isMoodField = (type: SortType): type is MoodField =>
  (MOOD_TYPES as readonly string[]).includes(type);
const isMedicalField = (type: SortType): type is MedicalField =>
  (MEDICAL_TYPES as readonly string[]).includes(type);

const filterTextFor = (type: SortType): string => {
  if (type === 'mostRecent') return 'MOST RECENT';
  if (type === 'topRated') return 'TOP RATED';
  if (isMoodField(type)) return `MOOD: ${type.toUpperCase()}`;
  if (isMedicalField(type)) return `MEDICAL: ${type.toUpperCase()}`;
  return '';
};

const sortLogs = (logs: Log[], type: SortType): Log[] => {
  if (type === 'mostRecent') {
    const sorted = [...logs];
    sorted.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    return sorted;
  }
  if (type === 'topRated') {
    const sorted = [...logs];
    sorted.sort((a, b) => (b.finalRating || 0) - (a.finalRating || 0));
    return sorted;
  }
  if (isMoodField(type) || isMedicalField(type)) {
    // A 0 means that mood/medical effect wasn't rated at all for that log —
    // filtering it out rather than just sorting it to the bottom, since
    // "Mood: Happy" implies "logs rated for happiness," not "every log."
    return logs
      .filter(log => log[type] > 0)
      .sort((a, b) => b[type] - a[type]);
  }
  return logs;
};

const searchLogs = (logs: Log[], searchText: string): Log[] => {
  if (searchText === '') return logs;
  return logs.filter(
    log =>
      log.strain.toLowerCase().includes(searchText.toLowerCase()) ||
      (log.tags || []).some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );
};

const HomeScreen = ({ navigation }: AppScreenProps<'Home'>) => {
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sortType, setSortType] = useState<SortType>('mostRecent');
  const [filterText, setFilterText] = useState('MOST RECENT');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const bottomAnim = useRef(new Animated.Value(-600)).current;

  const getLogs = useCallback(async () => {
    const userId = await currentUserId();
    if (!userId) {
      return;
    }

    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('user_id', userId)
      .order('logged_at', { ascending: false });

    if (error) {
      console.error(error);
      setIsLoading(false);
      return;
    }

    const logs = data.map(fromRow);
    setAllLogs(logs);
    // Re-apply whatever search/sort was active — otherwise a refetch (e.g. on
    // focus, after coming back from ViewLog) silently drops them back to
    // unfiltered DB order.
    setFilteredLogs(sortLogs(searchLogs(logs, searchText), sortType));
    setIsLoading(false);
  }, [sortType, searchText]);

  useEffect(() => {
    getLogs();

    // Replaces componentWillReceiveProps (removed in React 19) and the
    // { forceUpdate: true } navigation param it keyed off.
    const unsubscribeFocus = navigation.addListener('focus', () => getLogs());
    return unsubscribeFocus;
  }, [navigation, getLogs]);

  const search = (text: string) => {
    setSearchText(text);
    setFilteredLogs(sortLogs(searchLogs(allLogs, text), sortType));
  };

  // `bottom` is a layout property, so this cannot run on the native driver.
  const animateSheet = (toValue: number, onComplete?: () => void) => {
    Animated.timing(bottomAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false
    }).start(onComplete);
  };

  const showFilterModal = () => {
    animateSheet(0);
    setShowModal(true);
  };

  const hideModal = () => {
    animateSheet(-600, () => setShowModal(false));
  };

  const sortBy = (type: SortType = 'mostRecent') => {
    setSortType(type);
    setFilterText(filterTextFor(type));
    const tempLogs = sortLogs(searchLogs(allLogs, searchText), type);
    animateSheet(-600, () => {
      setFilteredLogs(tempLogs);
      setShowModal(false);
    });
  };

  const onRefresh = async () => {
    await getLogs();
    setRefreshing(false);
  };

  const strainsSet = new Set<string>();
  allLogs.forEach(log => strainsSet.add(log.strain));
  const numStrains = strainsSet.size;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Ionicons style={styles.searchIcon} name={'search'} size={32} />
          <TextInput
            style={styles.searchInput}
            placeholder={'Search strain or tag'}
            value={searchText}
            onChangeText={text => search(text)}
          />
        </View>
        <TouchableOpacity style={styles.filterContainer} onPress={() => showFilterModal()}>
          <Ionicons style={styles.filterIcon} name={'filter'} size={32} />
          <Text style={styles.filterText}>{filterText}</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color="#9b9b9b" />
      ) : filteredLogs.length === 0 ? (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'WorkSans', fontSize: 16 }}>
            {isMoodField(sortType) || isMedicalField(sortType)
              ? `NO LOGS FOR ${filterText}`
              : 'NO LOGS'}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.logsContainer}
          data={filteredLogs}
          keyExtractor={item => item.id || ''}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                onRefresh();
              }}
            />
          }
          renderItem={({ item }) => (
            <ListItem
              item={item}
              onPress={() => {
                navigation.push('ViewLog', {
                  log: item,
                  initialRatingsType: isMedicalField(sortType) ? 'medical' : undefined
                });
              }}
              onPressDelete={async () => {
                const { error } = await supabase
                  .from('logs')
                  .delete()
                  .eq('id', item.id);
                if (error) {
                  return console.error(error);
                }
                await getLogs();
              }}
            />
          )}
        />
      )}
      <View style={styles.footerContainer}>
        <BlackButton
          onPress={() => navigation.navigate('LogNewSession')}
          text={'LOG NEW SESSION'}
        />
        <View style={styles.strainsContainer}>
          <Text style={styles.numStrains}>{numStrains}</Text>
          <Text style={styles.strainsRecorded}>
            STRAIN
            {numStrains === 1 ? '' : 'S'} RECORDED
          </Text>
        </View>
      </View>
      {showModal && (
        <View style={styles.modal}>
          <TouchableHighlight style={styles.top} onPress={() => hideModal()}>
            <View />
          </TouchableHighlight>
          <Animated.View style={[styles.bottom, { bottom: bottomAnim }]}>
            <View style={styles.modalHeaderContainer}>
              <Ionicons
                style={styles.closeIcon}
                name={'close'}
                size={32}
                onPress={() => hideModal()}
              />
              <Text style={styles.filterOptionsHeaderText}>Filter Options</Text>
            </View>
            <ScrollView style={{ paddingBottom: 56 }}>
              <FilterButton onPress={() => sortBy('mostRecent')} text={'MOST RECENT'} />
              <FilterButton onPress={() => sortBy('topRated')} text={'TOP RATED'} />
              <FilterButton onPress={() => sortBy('happy')} text={'MOOD: HAPPY'} />
              <FilterButton onPress={() => sortBy('creative')} text={'MOOD: CREATIVE'} />
              <FilterButton onPress={() => sortBy('active')} text={'MOOD: ACTIVE'} />
              <FilterButton onPress={() => sortBy('relaxed')} text={'MOOD: RELAXED'} />
              <FilterButton onPress={() => sortBy('sleepy')} text={'MOOD: SLEEPY'} />
              <FilterButton onPress={() => sortBy('anxiety')} text={'MEDICAL: ANXIETY'} />
              <FilterButton onPress={() => sortBy('migraines')} text={'MEDICAL: MIGRAINES'} />
              <FilterButton onPress={() => sortBy('depression')} text={'MEDICAL: DEPRESSION'} />
              <FilterButton onPress={() => sortBy('pain')} text={'MEDICAL: PAIN'} />
              <FilterButton onPress={() => sortBy('insomnia')} text={'MEDICAL: INSOMNIA'} />
            </ScrollView>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const FilterButton = ({ onPress, text }: { onPress: () => void; text: string }) => (
  <TouchableOpacity
    style={{ alignItems: 'center', justifyContent: 'center', height: 56 }}
    onPress={() => onPress()}
  >
    <Text style={{ fontSize: 16, fontFamily: 'WorkSans', lineHeight: 56 }}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#FFF'
  },
  headerContainer: {},
  searchIcon: {
    position: 'absolute',
    zIndex: 100,
    top: 12,
    left: 16
  },
  searchInput: {
    height: 56,
    fontFamily: 'PlayfairDisplay-Regular',
    backgroundColor: '#FFF',
    padding: 8,
    paddingLeft: 56,
    fontSize: 24,
    borderBottomWidth: 1,
    borderColor: '#d8d8d8'
  },
  filterContainer: {
    height: 56,
    paddingRight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#d8d8d8'
  },
  filterIcon: {
    padding: 8
  },
  filterText: {
    fontSize: 16,
    fontFamily: 'WorkSans'
  },
  logsContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFF'
  },
  footerContainer: {
    backgroundColor: '#F4F3EF',
    width: '100%',
    height: 148,
    borderTopWidth: 1,
    borderColor: '#d8d8d8',
    paddingTop: 16,
    paddingRight: 32,
    paddingLeft: 32
  },
  strainsContainer: {
    alignItems: 'flex-end'
  },
  numStrains: {
    fontFamily: 'PlayfairDisplay-Regular',
    fontSize: 32
  },
  strainsRecorded: {
    fontFamily: 'WorkSans',
    fontSize: 16
  },

  modal: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: 500
    // bottom: 90
  },
  top: {
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
    opacity: 0.7,
    position: 'absolute',
    zIndex: 300
  },
  bottom: {
    height: '60%',
    width: '100%',
    backgroundColor: '#fff',
    position: 'absolute',
    zIndex: 400
  },
  modalHeaderContainer: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: '#9b9b9b',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingTop: 12,
    paddingLeft: 16,
    paddingBottom: 12,
    paddingRight: 16
  },
  filterOptionsHeaderText: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Regular'
  },
  filterOptionsText: {
    fontSize: 16,
    fontFamily: 'WorkSans',
    padding: 16
  }
});

export default HomeScreen;
