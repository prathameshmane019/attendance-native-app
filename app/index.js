import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = () => {
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      const redirectToLogin = () => {
        router.replace('/(auth)/login');
      };

      // Use a short timeout to ensure the navigation happens after the component is fully mounted
      const timer = setTimeout(redirectToLogin, 0);

      return () => clearTimeout(timer);
    }, [])
  );

  // Return an empty view while waiting to redirect
  return <View />;
};

export default HomeScreen;