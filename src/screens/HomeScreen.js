import React from 'react';
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as firebase from 'firebase';
import { ScrollView } from 'react-native-gesture-handler';

import ListItem from '../components/ListItem';

class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'LOG BOOK',
      headerRight: (
        <TouchableOpacity style={{ right: 16 }} onPress={() => navigation.push('Me')}>
          <Ionicons name={'ios-contact-outline'} size={32} />
        </TouchableOpacity>
      )
    };
  };

  state = {
    logs: []
  };

  async componentDidMount() {
    const userId = await AsyncStorage.getItem('userId');
    const snapshot = await firebase
      .database()
      .ref(`logs/${userId}`)
      .orderByKey()
      .once('value');
    const logs = snapshot.val();

    this.setState({
      logs: Object.keys(logs)
        .reverse()
        .map(date => ({ date, ...logs[date] }))
    });
  }

  render() {
    const strainsSet = new Set();
    this.state.logs.forEach(log => strainsSet.add(log.strain));
    const numStrains = strainsSet.size;

    return (
      <View style={styles.container}>
        <View style={styles.searchInputContainer}>
          <Ionicons style={styles.searchIcon} name={'ios-search'} size={32} />
          <TextInput style={styles.searchInput} placeholder={'Search'} />
        </View>
        <ScrollView style={styles.logsContainer}>
          <FlatList
            data={this.state.logs}
            keyExtractor={(item, i) => i.toString()}
            renderItem={({ item }) => {
              return <ListItem item={item} onPress={() => console.log(item)} />;
            }}
          />
        </ScrollView>
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>CREATE NEW LOG</Text>
          </TouchableOpacity>
          <View style={styles.strainsContainer}>
            <Text style={styles.numStrains}>{numStrains}</Text>
            <Text style={styles.strainsRecorded}>
              STRAIN
              {numStrains === 1 ? '' : 'S'} RECORDED
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between'
  },
  searchInputContainer: {
    // display: 'flex'
    // alignItems: 'center',
    // justifyContent: 'flex-start'
  },
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
    borderColor: '#e2e2e2'
  },
  logsContainer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFF'
  },
  footerContainer: {
    backgroundColor: '#FFF',
    width: '100%',
    height: 148,
    borderTopWidth: 1,
    borderColor: '#e2e2e2',
    paddingTop: 16,
    paddingRight: 32,
    paddingLeft: 32
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
  }
});

export default HomeScreen;