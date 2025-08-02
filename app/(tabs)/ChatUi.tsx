import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

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
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        const receiver = await AsyncStorage.getItem('receiverId');
        const token = await AsyncStorage.getItem('token');

        if (userId && receiver && token) {
          const parsedUserId = parseInt(userId);
          const parsedReceiverId = parseInt(receiver);

          setCurrentUserId(parsedUserId);
          setReceiverId(parsedReceiverId);
          fetchMessages(parsedUserId, parsedReceiverId);

          // Initialize Socket.io
          const newSocket = io('http://192.168.56.1:4000', {
            transports: ['websocket'],
            autoConnect: true
          });

          newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            newSocket.emit('authenticate', { token });
            // Join the user's own room for real-time updates
            newSocket.emit('join', { userId: parsedUserId });
          });

          newSocket.on('receiveMessage', (message: Message) => {
            setMessages(prev => {
              if (prev.some(m => m.id === message.id)) return prev;
              return [...prev, message];
            });
          });

          setSocket(newSocket);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();

    return () => {
      if (socket) socket.disconnect();
    };
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
    if (newMessage.trim() && currentUserId && receiverId && socket) {
      const token = await AsyncStorage.getItem('token');

      // Emit message through socket
      socket.emit('sendMessage', {
        token,
        receiverId,
        content: newMessage.trim(),
      });

      // Only clear the input, do not optimistically add the message
      setNewMessage('');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUserId ? styles.myMessage : styles.contactMessage
      ]}
    >
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.timeText}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
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
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 0,
    marginRight: 5,
  },
  contactMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 0,
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
