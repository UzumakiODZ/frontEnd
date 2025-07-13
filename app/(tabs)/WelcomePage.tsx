import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WelcomePage = () => {
  const [username, setUsername] = useState('');
  const router = useRouter();

  const handleContinue = async () => {
    try {
      if (username.trim()) {
        await AsyncStorage.setItem('username', username);
        router.push('/NearbyUser'); // Use Expo Router navigation
      } else {
        Alert.alert('Validation Error', 'Please enter your PikaName!');
      }
    } catch (error) {
      console.error('Error saving username:', error);
      Alert.alert('Error', 'Failed to save your name. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome!</Text>
      <Text style={styles.pikaName}>Enter your PikaName</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your name"
        placeholderTextColor="#666"
        autoCapitalize="words"
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  pikaName: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: 'yellow',
    borderWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  }
});

export default WelcomePage;
