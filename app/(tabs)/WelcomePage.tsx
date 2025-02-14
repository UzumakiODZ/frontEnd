import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';

const WelcomePage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.pikaName}>Enter your PikaName</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  pikaName: {
    fontSize: 20,
    color: '#333',
  },
  textofname: {
    borderColor: 'yellow',  
    borderWidth: 3,         
  }
});

export default WelcomePage;
