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
  Keyboard,
  useWindowDimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import ListItem from '@/components/ListItem';
import PrimaryButton from '@/components/PrimaryButton';
import HeaderButton from '@/components/HeaderButton';
import { supabase, currentUserId } from '@/lib/supabase';
import { fromRow } from '@/lib/logs';
import { getHomeFilters, setHomeFilters } from '@/lib/homeFilters';
import type { SortType } from '@/lib/homeFilters';
import {
  isMoodField,
  isMedicalField,
  filterTextFor,
  emptyStateLabelFor,
  emptyStateMessage,
  sortLogs,
  searchLogs,
  filterByYear
} from '@/lib/homeLogFilters';
import type { Log } from '@/types/log';
import type { AppScreenProps } from '@/types/navigation';

export const homeScreenOptions = ({
  navigation
}: AppScreenProps<'Home'>): NativeStackNavigationOptions => ({
  title: 'LOG BOOK',
  headerRight: () => (
    <HeaderButton name={'person-outline'} onPress={() => navigation.push('Me')} />
  )
});

const MODAL_ROW_HEIGHT = 56;
const SEARCH_DEBOUNCE_MS = 200;

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
  const [searchInput, setSearchInput] = useState(() => getHomeFilters().searchText);
  const bottomAnim = useRef(new Animated.Value(-600)).current;
  const yearBottomAnim = useRef(new Animated.Value(-600)).current;
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    setFilteredLogs(sortLogs(searchLogs(filterByYear(logs, selectedYear), searchText), sortType));
    setIsLoading(false);
  }, [sortType, searchText, selectedYear]);

  useEffect(() => {
    getLogs();

    const unsubscribeFocus = navigation.addListener('focus', () => getLogs());
    return unsubscribeFocus;
  }, [navigation, getLogs]);

  const search = (text: string) => {
    setSearchText(text);
    setHomeFilters({ searchText: text });
    setFilteredLogs(sortLogs(searchLogs(filterByYear(allLogs, selectedYear), text), sortType));
  };

  const onSearchInputChange = (text: string) => {
    setSearchInput(text);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = setTimeout(() => search(text), SEARCH_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const animateSheet = (toValue: number, onComplete?: () => void) => {
    Animated.timing(bottomAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false
    }).start(onComplete);
  };

  const showFilterModal = () => {
    Keyboard.dismiss();
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
    setFilteredLogs(sortLogs(searchLogs(filterByYear(allLogs, selectedYear), searchText), type));
    animateSheet(-600, () => {
      setShowModal(false);
    });
  };

  const animateYearSheet = (toValue: number, onComplete?: () => void) => {
    Animated.timing(yearBottomAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false
    }).start(onComplete);
  };

  const showYearFilterModal = () => {
    Keyboard.dismiss();
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
    setSortType('mostRecent');
    setFilterText(filterTextFor('mostRecent'));
    setHomeFilters({ selectedYear: year, sortType: 'mostRecent' });
    setFilteredLogs(
      sortLogs(searchLogs(filterByYear(allLogs, year), searchText), 'mostRecent')
    );
    animateYearSheet(-600, () => {
      setShowYearModal(false);
    });
  };

  const availableYears = Array.from(
    new Set(
      allLogs
        .map(log => (log.date ? new Date(log.date).getFullYear() : null))
        .filter((year): year is number => year !== null)
    )
  ).sort((a, b) => b - a);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft:
        availableYears.length > 1
          ? () => (
              <HeaderButton
                name={'calendar-clear-outline'}
                size={24}
                onPress={() => showYearFilterModal()}
              />
            )
          : undefined
    });
  }, [navigation, showModal, availableYears.length]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: selectedYear === null ? 'LOG BOOK' : `${selectedYear} LOG BOOK`
    });
  }, [navigation, selectedYear]);

  useEffect(() => {
    if (!isLoading && availableYears.length <= 1 && selectedYear !== null) {
      setSelectedYear(null);
      setHomeFilters({ selectedYear: null });
      setFilteredLogs(sortLogs(searchLogs(filterByYear(allLogs, null), searchText), sortType));
    }
  }, [isLoading, availableYears.length, selectedYear]);

  const onRefresh = async () => {
    await getLogs();
    setRefreshing(false);
  };

  const strainsSet = new Set<string>();
  filterByYear(allLogs, selectedYear).forEach(log => strainsSet.add(log.strain));
  const numStrains = strainsSet.size;

  const yearModalHeight = Math.min(
    MODAL_ROW_HEIGHT * (availableYears.length + 2),
    windowHeight * 0.6
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Ionicons style={styles.searchIcon} name={'search-outline'} size={32} />
          <TextInput
            style={styles.searchInput}
            placeholder={'Search strain or tag'}
            value={searchInput}
            onChangeText={onSearchInputChange}
          />
        </View>
        <TouchableOpacity style={styles.filterContainer} onPress={() => showFilterModal()}>
          <Ionicons style={styles.filterIcon} name={'funnel'} size={32} />
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
        <PrimaryButton
          style={styles.logNewSessionButton}
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
      {(showModal || showYearModal) && (
        <TouchableHighlight
          style={styles.top}
          onPress={() => {
            if (showModal) hideModal();
            if (showYearModal) hideYearModal();
          }}
        >
          <View />
        </TouchableHighlight>
      )}
      {showModal && (
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
      )}
      {showYearModal && (
        <Animated.View style={[styles.bottom, { bottom: yearBottomAnim, height: yearModalHeight }]}>
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
    left: 12
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
  logNewSessionButton: {
    width: '100%'
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
