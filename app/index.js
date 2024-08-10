import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
const HomeScreen = () => {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync()
  }, [])
  const router = useRouter();

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