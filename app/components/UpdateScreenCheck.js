import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const UpdateCheckScreen = () => {
  const router = useRouter();

  const navigateToUpdateInfo = () => {
    router.push('/update-info');
  };

  return (
    <View style={{ marginRight: 10 }}>
      <TouchableOpacity onPress={navigateToUpdateInfo}>
        <Ionicons name="cloud-download-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default UpdateCheckScreen;