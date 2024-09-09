import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UpdateInfoScreen = () => {
  const [lastUpdateCheck, setLastUpdateCheck] = useState('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadLastUpdateCheck();
    checkForUpdate();
  }, []);

  const loadLastUpdateCheck = async () => {
    const date = await AsyncStorage.getItem('lastUpdateCheck');
    setLastUpdateCheck(date || 'Never');
  };

  const checkForUpdate = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      setUpdateAvailable(update.isAvailable);
    } catch (error) {
      console.error('Error checking for update:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error updating app:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Update Information</Text>
      <Text style={styles.info}>Last checked: {lastUpdateCheck}</Text>
      <Text style={styles.info}>
        Update available: {updateAvailable ? 'Yes' : 'No'}
      </Text>
      {updateAvailable && (
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Update Now</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.button} onPress={checkForUpdate}>
        <Text style={styles.buttonText}>Check for Updates</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6a11cb',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default UpdateInfoScreen;