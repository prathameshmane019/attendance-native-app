import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const router = useRouter();

  async function checkAndUpdate() {
    const lastUpdateCheck = await AsyncStorage.getItem('lastUpdateCheck');
    const currentDate = new Date().toDateString();

    if (lastUpdateCheck !== currentDate) {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
        await AsyncStorage.setItem('lastUpdateCheck', currentDate);
      } catch (error) {
        console.error(`Error fetching latest Expo update: ${error}`);
      }
    }
  }

  React.useEffect(() => {
    checkAndUpdate();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const redirectToLogin = () => {
        router.replace('/(auth)/login');
      };

      const timer = setTimeout(redirectToLogin, 0);

      return () => clearTimeout(timer);
    }, [])
  );

  return <View />;
};

export default HomeScreen;