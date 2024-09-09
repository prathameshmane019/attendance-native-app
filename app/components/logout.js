import React, { useContext } from 'react';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AuthContext from '../AuthContext';
import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LogoutButton() {
  const { logout, user } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  return user && <Button onPress={handleLogout} style={styles.logoutButton} icon={({ size, color }) => (
    <MaterialCommunityIcons name="logout" size={size} color={"#fff"} />
  )}></Button>;



}
const styles = StyleSheet.create({
  logoutButton: {
  }
})