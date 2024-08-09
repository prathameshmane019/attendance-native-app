import AsyncStorage from '@react-native-async-storage/async-storage';

const getUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  };
  export default getUserData;