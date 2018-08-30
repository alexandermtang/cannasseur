import React from 'react';
import { Font } from 'expo';
import { createSwitchNavigator, createStackNavigator } from 'react-navigation';
import * as firebase from 'firebase';

import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';

const AuthStack = createStackNavigator(
  {
    Login: LoginScreen
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none',
    navigationOptions: {
      headerVisible: false
    }
  }
);

const AppStack = createStackNavigator(
  {
    Home: HomeScreen
  },
  {
    initialRouteName: 'Home',
    navigationOptions: {
      headerStyle: {
        backgroundColor: '#F4F3EF'
      },
      headerTintColor: '#000',
      headerTitleStyle: {
        fontFamily: 'WorkSans'
      }
    }
  }
);

const SwitchNavigator = createSwitchNavigator(
  {
    App: AppStack,
    Auth: AuthStack
  },
  {
    initialRouteName: 'Auth'
  }
);

class App extends React.Component {
  state = {
    fontLoaded: false
  };

  constructor() {
    super();
    const config = {
      apiKey: 'AIzaSyAhvETpCtA9thHsBvq9Nms08jXB8X93kWc',
      authDomain: 'cannasseur-3e6f3.firebaseapp.com',
      databaseURL: 'https://cannasseur-3e6f3.firebaseio.com',
      projectId: 'cannasseur-3e6f3',
      storageBucket: 'cannasseur-3e6f3.appspot.com',
      messagingSenderId: '59531614040'
    };
    firebase.initializeApp(config);
  }

  async componentDidMount() {
    await Font.loadAsync({
      'PlayfairDisplay-Italic': require('./assets/fonts/PlayfairDisplay-Italic.ttf'),
      'PlayfairDisplay-Regular': require('./assets/fonts/PlayfairDisplay-Regular.ttf'),
      WorkSans: require('./assets/fonts/WorkSans-Regular.ttf')
    });

    this.setState({ fontLoaded: true });
  }

  render() {
    return this.state.fontLoaded && <SwitchNavigator />;
  }
}

export default App;
