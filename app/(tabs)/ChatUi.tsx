import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

const ChatUi = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [receiverId, setReceiverId] = useState<number | null>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const receiver = await AsyncStorage.getItem('receiverId');
        
        if (userId && receiver) {
          setCurrentUserId(parseInt(userId));
          setReceiverId(parseInt(receiver));
          fetchMessages(parseInt(userId), parseInt(receiver));
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, []);

  const fetchMessages = async (senderId: number, receiverId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `http://192.168.56.1:4000/messages?senderId=${senderId}&receiverId=${receiverId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      Alert.alert('Error', 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (newMessage.trim() && currentUserId && receiverId) {
      try {
        const response = await fetch('http://192.168.56.1:4000/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            senderId: currentUserId,
            receiverId: receiverId
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const savedMessage = await response.json();
        if (savedMessage.error) {
          throw new Error(savedMessage.error);
        }

        setMessages(prevMessages => [...prevMessages, savedMessage]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" />;
  }

  const renderItem = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.senderId === currentUserId ? styles.myMessage : styles.contactMessage
    ]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timeText}>{item.createdAt}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesList}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DDD5', 
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 15,
    maxWidth: '75%',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', // Light green like WhatsApp
    borderBottomRightRadius: 0, // WhatsApp-like tail
    marginRight: 5,
  },
  contactMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', // White background for received messages
    borderBottomLeftRadius: 0, // WhatsApp-like tail
    marginLeft: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timeText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#FFF',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ChatUi;
