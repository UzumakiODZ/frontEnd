import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationHandler from './(tabs)/NotificationHandler';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Auth state
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    const isLoggedIn = !!token;

    setIsLoggedIn(isLoggedIn);
    setAuthChecked(true);

    if (!isLoggedIn) {
      if (pathname !== '/LoginPage' && pathname !== '/SignUp') {
        router.replace('/LoginPage');
      }
    } else {
      if (pathname === '/SignUp') {
        router.replace('/WelcomePage');
      } else if (
        pathname === '/LoginPage' ||
        pathname === '/WelcomePage' ||
        pathname === '/'
      ) {
        router.replace('/(tabs)/NearbyUser');
      }
    }
  };

  checkAuth();
}, [pathname, router]);


  useEffect(() => {
    if (loaded && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [loaded, authChecked]);

  if (!loaded || !authChecked) {
    return null; 
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <NotificationHandler />
      <Slot />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
