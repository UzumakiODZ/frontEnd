import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';

// 1. Define Interface for the Data Payload coming from Backend
interface NotificationPayload {
  chatId: string;
  senderId: string;
}

// 2. Configure Global Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export default function NotificationHandler() {
  // 3. Type the Ref correctly for the subscription
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    // A. Register the Category
    registerNotificationCategory();

    // B. Get Token & Send to Backend
    registerForPushNotificationsAsync().then(async (token) => {
        console.log("Push Notification Token:", token);
      if (token) {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          // Replace with your actual backend URL
          try {
            await axios.post(`${BASE_URL}/update-push-token`, {
              userId: userId,
              token: token,
            });
            console.log("Push Token updated for user", userId);
          } catch (e) {
            console.error("Failed to sync token", e);
          }
        }
      }
    });

    // C. Listen for User Interaction (The Reply)

    
    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const actionId = response.actionIdentifier;
      const userText = (response as any).userText; // 'userText' exists on reply actions but TS might miss it without casting or strict checks
      
      // Safe cast the data to our interface
      const data = response.notification.request.content.data as unknown as NotificationPayload;
      const { chatId, senderId } = data;
      console.log("Notification Response Data:", data);
      console.log("Sender Id from Notification:", senderId);
      // Check if they clicked the "Reply" button
      if (actionId === 'reply_button_id') {
        try {
          const currentUserId = await AsyncStorage.getItem('userId');

          if (!currentUserId) {
            console.error("No user ID found, cannot reply");
            return;
          }

          // HIT YOUR BACKEND ENDPOINT
          await axios.post(`${BASE_URL}/messages`, {
            content: userText,
            receiverId: chatId,
            senderId: senderId,
            
          });

          console.log("Reply sent successfully from", senderId, "to", currentUserId);
        } catch (error) {
          console.error("Failed to send background reply:", error);
        }
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return null;
}

// --- Helper Functions ---

async function registerNotificationCategory() {
  await Notifications.setNotificationCategoryAsync('chat-reply', [
    {
      identifier: 'reply_button_id',
      buttonTitle: 'Reply',
      textInput: {
        submitButtonTitle: 'Send',
        placeholder: 'Type a reply...',
      },
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
}

async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  console.log("1. Starting registerForPushNotificationsAsync..."); 
  
  let token: string | undefined;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    console.log("2. Is physical device. Checking permissions..."); // DEBUG LOG
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        console.log("3. Permission not granted yet. Requesting..."); // DEBUG LOG
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log("❌ Failed: Permission denied!"); // DEBUG LOG
      alert('Failed to get push token for push notification!');
      return undefined;
    }

    console.log("4. Permissions granted. Fetching token..."); // DEBUG LOG

    // HARDCODE YOUR PROJECT ID HERE TO TEST
    // You can find this in your app.json under "extra" -> "eas" -> "projectId"
    // OR on the Expo Dashboard website
    const projectId = "ec92f1b0-ed69-47d6-95d7-f9667f2c7dc1"; 

    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: projectId, 
        });
        token = tokenData.data;
        console.log("✅ SUCCESS! My Push Token:", token);
    } catch (e) {
        console.error("❌ CRASH: Error fetching token:", e);
    }
  } else {
    console.log("❌ Failed: Must use physical device");
    alert('Must use physical device for Push Notifications');
  }

  return token;
}