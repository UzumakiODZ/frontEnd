import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, Image } from 'react-native';

const NearbyUser = () => {
  interface User {
    id: number;
    username: string;
    distance: number;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      try {
        const response = await fetch('http://192.168.56.1:4000/nearby-users/3'); // Replace with actual userId
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching nearby users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Nearby Users</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : users.length > 0 ? (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.pikaNameContainer}>
              <Text style={styles.pikaName}>{item.username}</Text>
              <View style={styles.userInfo}>
                <Image
                  source={require('../../assets/images/icons8-chat-24.png')}
                  style={styles.icon}
                />
                <Text style={styles.pikaName}>{item.distance.toFixed(2)} km away</Text>
              </View>
            </View>
          )}
        />
      ) : (
        <Text style={styles.pikaName}>No nearby users found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8', 
    width: '100%',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333', 
  },
  FlatList: {
    width: '100%',
  },
  pikaNameContainer: {
    marginVertical: 8,
    padding: 5,
    borderRadius: 12,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, 
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  pikaName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444', 
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 8,
    tintColor: '#007AFF', 
  },
});


export default NearbyUser;