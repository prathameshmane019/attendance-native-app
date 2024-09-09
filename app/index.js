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

      const timer = setTimeout(redirectToLogin, 0);

      return () => clearTimeout(timer);
    }, [])
  );

  return <View />;
};

export default HomeScreen;