import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginPage from './LoginPage'; 
import WelcomePage from './WelcomePage';
import NearbyUser from './NearbyUser';

const Stack = createStackNavigator();

const App = () => {
  return (
   
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Welcome" component={WelcomePage} />
        <Stack.Screen name="NearbyUsers" component={NearbyUser} />
      </Stack.Navigator>
   
  );
};

export default App;
