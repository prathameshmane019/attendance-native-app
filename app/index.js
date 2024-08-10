import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const HomeScreen = () => {
  async function onFetchUpdateAsync() {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      }
    } catch (error) {
      console.error(`Error fetching latest Expo update: ${error}`);
    }
  }

  useEffect(() => {
    onFetchUpdateAsync();
  }, []);

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