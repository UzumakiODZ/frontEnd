import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native';

const NearbyUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      try {
        const response = await fetch('http://localhost:4000/nearby-users/1');
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
            <Text style={styles.pikaName}>{item.username} - {item.distance.toFixed(2)} km away</Text>
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
    backgroundColor: '#F5FCFF',
  },
  welcomeText: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  pikaName: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default NearbyUser;
