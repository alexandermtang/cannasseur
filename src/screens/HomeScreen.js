import React from 'react';
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

import ListItem from '../components/ListItem';
import BlackButton from '../components/BlackButton';
import HeaderButton from '../components/HeaderButton';
import { supabase, currentUserId } from '../lib/supabase';
import { fromRow } from '../lib/logs';

export const homeScreenOptions = ({ navigation }) => ({
  title: 'LOG BOOK',
  headerRight: () => (
    <HeaderButton name={'person-circle-outline'} onPress={() => navigation.push('Me')} />
  )
});

class HomeScreen extends React.Component {
  state = {
    allLogs: [],
    filteredLogs: [],
    isLoading: true,
    showModal: false,
    filterText: 'MOST RECENT',
    bottomAnim: new Animated.Value(-600),
    refreshing: false
  };

  async getLogs() {
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
      return this.setState({ isLoading: false });
    }

    const allLogs = data.map(fromRow);
    this.setState({ allLogs, filteredLogs: allLogs, isLoading: false });
  }

  componentDidMount() {
    this.getLogs();

    // Replaces componentWillReceiveProps (removed in React 19) and the
    // { forceUpdate: true } navigation param it keyed off.
    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => this.getLogs());
  }

  componentWillUnmount() {
    if (this.unsubscribeFocus) {
      this.unsubscribeFocus();
    }
  }

  search(searchText) {
    if (searchText === '') {
      this.setState({ filteredLogs: this.state.allLogs });
    } else {
      const filteredLogs = this.state.allLogs.reduce((logs, log) => {
        const isInclude =
          log.strain.toLowerCase().includes(searchText.toLowerCase()) ||
          (log.tags || []).some(tag => tag.toLowerCase().includes(searchText.toLowerCase()));
        return isInclude ? [...logs, log] : logs;
      }, []);

      this.setState({ filteredLogs });
    }
  }

  // `bottom` is a layout property, so this cannot run on the native driver.
  animateSheet(toValue, onComplete) {
    Animated.timing(this.state.bottomAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false
    }).start(onComplete);
  }

  showModal() {
    this.animateSheet(0);
    this.setState({ showModal: true });
  }

  hideModal() {
    this.animateSheet(-600, () => this.setState({ showModal: false }));
  }

  sortBy(type = 'mostRecent') {
    const tempLogs = [...this.state.allLogs];
    let filterText = '';

    if (type === 'mostRecent') {
      tempLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      filterText = 'MOST RECENT';
    } else if (type === 'topRated') {
      tempLogs.sort((a, b) => b.finalRating - a.finalRating);
      filterText = 'TOP RATED';
    } else if (['happy', 'creative', 'active', 'relaxed', 'sleepy'].includes(type)) {
      tempLogs.sort((a, b) => b[type] - a[type]);
      filterText = `MOOD: ${type.toUpperCase()}`;
    } else if (['anxiety', 'migraines', 'depression', 'pain', 'insomnia'].includes(type)) {
      tempLogs.sort((a, b) => b[type] - a[type]);
      filterText = `MEDICAL: ${type.toUpperCase()}`;
    }

    this.setState({ filterText });
    this.animateSheet(-600, () => {
      this.setState({ filteredLogs: tempLogs, showModal: false });
    });
  }

  async onRefresh() {
    await this.getLogs();
    this.setState({ refreshing: false });
  }

  render() {
    const strainsSet = new Set();
    this.state.allLogs.forEach(log => strainsSet.add(log.strain));
    const numStrains = strainsSet.size;

    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View>
            <Ionicons style={styles.searchIcon} name={'search'} size={32} />
            <TextInput
              style={styles.searchInput}
              placeholder={'Search strain or tag'}
              onChangeText={searchText => this.search(searchText)}
            />
          </View>
          <TouchableOpacity style={styles.filterContainer} onPress={() => this.showModal()}>
            <Ionicons style={styles.filterIcon} name={'filter'} size={32} />
            <Text style={styles.filterText}>{this.state.filterText}</Text>
          </TouchableOpacity>
        </View>
        {this.state.isLoading ? (
          <ActivityIndicator size="large" color="#9b9b9b" />
        ) : numStrains === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'WorkSans', fontSize: 16 }}>NO LOGS</Text>
          </View>
        ) : (
          <FlatList
            style={styles.logsContainer}
            data={this.state.filteredLogs}
            keyExtractor={item => item.id}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => {
                  this.setState({ refreshing: true });
                  this.onRefresh();
                }}
              />
            }
            renderItem={({ item }) => (
              <ListItem
                item={item}
                onPress={() => {
                  this.props.navigation.push('ViewLog', { log: item });
                }}
                onPressDelete={async () => {
                  const { error } = await supabase
                    .from('logs')
                    .delete()
                    .eq('id', item.id);
                  if (error) {
                    return console.error(error);
                  }
                  await this.getLogs();
                }}
              />
            )}
          />
        )}
        <View style={styles.footerContainer}>
          <BlackButton
            onPress={() => this.props.navigation.navigate('LogNewSession')}
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
        {this.state.showModal && (
          <View style={styles.modal}>
            <TouchableHighlight style={styles.top} onPress={() => this.hideModal()}>
              <View />
            </TouchableHighlight>
            <Animated.View style={[styles.bottom, { bottom: this.state.bottomAnim }]}>
              <View style={styles.modalHeaderContainer}>
                <Ionicons
                  style={styles.closeIcon}
                  name={'close'}
                  size={32}
                  onPress={() => this.hideModal()}
                />
                <Text style={styles.filterOptionsHeaderText}>Filter Options</Text>
              </View>
              <ScrollView style={{ paddingBottom: 56 }}>
                <FilterButton onPress={() => this.sortBy('mostRecent')} text={'MOST RECENT'} />
                <FilterButton onPress={() => this.sortBy('topRated')} text={'TOP RATED'} />
                <FilterButton onPress={() => this.sortBy('happy')} text={'MOOD: HAPPY'} />
                <FilterButton onPress={() => this.sortBy('creative')} text={'MOOD: CREATIVE'} />
                <FilterButton onPress={() => this.sortBy('active')} text={'MOOD: ACTIVE'} />
                <FilterButton onPress={() => this.sortBy('relaxed')} text={'MOOD: RELAXED'} />
                <FilterButton onPress={() => this.sortBy('sleepy')} text={'MOOD: SLEEPY'} />
                <FilterButton onPress={() => this.sortBy('anxiety')} text={'MEDICAL: ANXIETY'} />
                <FilterButton
                  onPress={() => this.sortBy('migraines')}
                  text={'MEDICAL: MIGRAINES'}
                />
                <FilterButton
                  onPress={() => this.sortBy('depression')}
                  text={'MEDICAL: DEPRESSION'}
                />
                <FilterButton onPress={() => this.sortBy('pain')} text={'MEDICAL: PAIN'} />
                <FilterButton onPress={() => this.sortBy('insomnia')} text={'MEDICAL: INSOMNIA'} />
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </View>
    );
  }
}

const FilterButton = ({ onPress, text }) => (
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
