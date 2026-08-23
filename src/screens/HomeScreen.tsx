import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react';
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
  RefreshControl,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import ListItem from '../components/ListItem';
import BlackButton from '../components/BlackButton';
import HeaderButton from '../components/HeaderButton';
import { supabase, currentUserId } from '../lib/supabase';
import { fromRow } from '../lib/logs';
import { getHomeFilters, setHomeFilters } from '../lib/homeFilters';
import type { SortType } from '../lib/homeFilters';
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

// Phrasing for the empty state reads differently from the filter button's
// own label — "ACTIVE MOOD" for a mood field, but just "INSOMNIA" (no
// "MEDICAL" prefix) for a medical one.
const emptyStateLabelFor = (type: SortType): string => {
  if (isMoodField(type)) return `${type.toUpperCase()} MOOD`;
  if (isMedicalField(type)) return type.toUpperCase();
  return '';
};

const emptyStateMessage = (type: SortType, year: number | null): string => {
  const base =
    isMoodField(type) || isMedicalField(type) ? `NO LOGS FOR ${emptyStateLabelFor(type)}` : 'NO LOGS';
  return year === null ? base : `${base} IN ${year}`;
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
      .sort(
        (a, b) =>
          b[type] - a[type] ||
          (b.finalRating || 0) - (a.finalRating || 0) ||
          new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
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

// null means ALL TIME — no filtering.
const filterByYear = (logs: Log[], year: number | null): Log[] => {
  if (year === null) return logs;
  return logs.filter(log => log.date && new Date(log.date).getFullYear() === year);
};

const MODAL_ROW_HEIGHT = 56; // matches FilterButton and modalHeaderContainer

const HomeScreen = ({ navigation }: AppScreenProps<'Home'>) => {
  const { height: windowHeight } = useWindowDimensions();
  const [allLogs, setAllLogs] = useState<Log[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sortType, setSortType] = useState<SortType>(() => getHomeFilters().sortType);
  const [filterText, setFilterText] = useState(() => filterTextFor(getHomeFilters().sortType));
  const [searchText, setSearchText] = useState(() => getHomeFilters().searchText);
  const [selectedYear, setSelectedYear] = useState<number | null>(
    () => getHomeFilters().selectedYear
  );
  const [showYearModal, setShowYearModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const bottomAnim = useRef(new Animated.Value(-600)).current;
  const yearBottomAnim = useRef(new Animated.Value(-600)).current;

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
    // Re-apply whatever search/sort/year was active — otherwise a refetch
    // (e.g. on focus, after coming back from ViewLog) silently drops them
    // back to unfiltered DB order.
    setFilteredLogs(sortLogs(searchLogs(filterByYear(logs, selectedYear), searchText), sortType));
    setIsLoading(false);
  }, [sortType, searchText, selectedYear]);

  useEffect(() => {
    getLogs();

    // Replaces componentWillReceiveProps (removed in React 19) and the
    // { forceUpdate: true } navigation param it keyed off.
    const unsubscribeFocus = navigation.addListener('focus', () => getLogs());
    return unsubscribeFocus;
  }, [navigation, getLogs]);

  const search = (text: string) => {
    setSearchText(text);
    setHomeFilters({ searchText: text });
    setFilteredLogs(sortLogs(searchLogs(filterByYear(allLogs, selectedYear), text), sortType));
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
    if (showYearModal) {
      animateYearSheet(-600, () => setShowYearModal(false));
    }
    animateSheet(0);
    setShowModal(true);
  };

  const hideModal = () => {
    animateSheet(-600, () => setShowModal(false));
  };

  const sortBy = (type: SortType = 'mostRecent') => {
    setSortType(type);
    setFilterText(filterTextFor(type));
    setHomeFilters({ sortType: type });
    // Set immediately, not in the animation callback below — the modal's
    // dark overlay covers the list for the whole slide-down regardless, but
    // deferring this let sortType (and the empty-state label it drives)
    // update a beat before filteredLogs did, flashing the new filter's empty
    // state over the old filter's stale results.
    setFilteredLogs(sortLogs(searchLogs(filterByYear(allLogs, selectedYear), searchText), type));
    animateSheet(-600, () => {
      setShowModal(false);
    });
  };

  // `bottom` is a layout property, so this cannot run on the native driver.
  const animateYearSheet = (toValue: number, onComplete?: () => void) => {
    Animated.timing(yearBottomAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false
    }).start(onComplete);
  };

  const showYearFilterModal = () => {
    if (showModal) {
      animateSheet(-600, () => setShowModal(false));
    }
    animateYearSheet(0);
    setShowYearModal(true);
  };

  const hideYearModal = () => {
    animateYearSheet(-600, () => setShowYearModal(false));
  };

  const selectYear = (year: number | null) => {
    setSelectedYear(year);
    setHomeFilters({ selectedYear: year });
    setFilteredLogs(sortLogs(searchLogs(filterByYear(allLogs, year), searchText), sortType));
    animateYearSheet(-600, () => {
      setShowYearModal(false);
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton name={'calendar-clear'} size={24} onPress={() => showYearFilterModal()} />
      )
    });
    // The icon itself never changes, but showYearFilterModal closes over
    // showModal (to close Filter Options first if it's open) — this still
    // needs to re-run when that changes, or the header button's onPress
    // stays frozen on showModal's value from the very first render.
  }, [navigation, showModal]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: selectedYear === null ? 'LOG BOOK' : `${selectedYear} LOG BOOK`
    });
  }, [navigation, selectedYear]);

  const onRefresh = async () => {
    await getLogs();
    setRefreshing(false);
  };

  const strainsSet = new Set<string>();
  filterByYear(allLogs, selectedYear).forEach(log => strainsSet.add(log.strain));
  const numStrains = strainsSet.size;

  const availableYears = Array.from(
    new Set(
      allLogs
        .map(log => (log.date ? new Date(log.date).getFullYear() : null))
        .filter((year): year is number => year !== null)
    )
  ).sort((a, b) => b - a);

  // ALL TIME row + one row per year + the modal's own header row, capped at
  // the same max height Filter Options uses (60% of the screen) — shorter
  // when there aren't enough years to need it.
  const yearModalHeight = Math.min(
    MODAL_ROW_HEIGHT * (availableYears.length + 2),
    windowHeight * 0.6
  );

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
            {emptyStateMessage(sortType, selectedYear)}
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
            {selectedYear === null ? '' : ` IN ${selectedYear}`}
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
      {showYearModal && (
        <View style={styles.modal}>
          <TouchableHighlight style={styles.top} onPress={() => hideYearModal()}>
            <View />
          </TouchableHighlight>
          <Animated.View
            style={[styles.bottom, { bottom: yearBottomAnim, height: yearModalHeight }]}
          >
            <View style={styles.modalHeaderContainer}>
              <Ionicons
                style={styles.closeIcon}
                name={'close'}
                size={32}
                onPress={() => hideYearModal()}
              />
              <Text style={styles.filterOptionsHeaderText}>Select Year</Text>
            </View>
            <ScrollView style={{ paddingBottom: 56 }}>
              <FilterButton onPress={() => selectYear(null)} text={'ALL TIME'} />
              {availableYears.map(year => (
                <FilterButton key={year} onPress={() => selectYear(year)} text={String(year)} />
              ))}
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
