import React, { useState, useContext } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import AuthContext from '../AuthContext';
import { TextInput, Button, Surface, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const ResetPasswordScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter(); 
  const API_URL = process.env.API_URL
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/reset-password`, { identifier, oldPassword, newPassword });
      if (response.status === 200) {
        alert('Password reset successfully');
        router.push("/login");
      } else {
        alert(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Failed to reset password', error);
      alert('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient
        colors={['#CD91F0', '#51047D']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
        <Image
            source={require('../../assets/login.png')}
            style={styles.illustration}
          />
          <Surface style={styles.surface}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput
              label="User ID"
              value={identifier}
              onChangeText={setIdentifier}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Old Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
            />
            <View style={styles.bottomAction}>
              <Button
                mode="outlined"
                onPress={() => { setIdentifier(''); setOldPassword(''); setNewPassword(''); }}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.resetButton}
                icon={({ size, color }) => (
                  <MaterialCommunityIcons name="key" size={size} color={color} />
                )}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Reset Password'}
              </Button>
            </View>
          </Surface>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  illustration: {
    width: 300,
    height: 300,
   marginVertical:40,
    alignSelf: 'center',
  },
  
  gradient: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 0,
  },
  surface: {
    padding: 20,
    borderTopStartRadius: 50,
    borderTopEndRadius: 50,
    elevation: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    minHeight: 425,
    // paddingBottom:20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  bottomAction: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginVertical: 10,
  },
  cancelButton: {
    marginTop: 10,
    width: '50%',
    paddingVertical: 3,
    marginHorizontal: 8,
    borderRadius: 25,
  },
  resetButton: {
    marginTop: 10,
    width: '50%',
    paddingVertical: 5,
    backgroundColor: '#6a11cb',
    borderRadius: 25,
    marginHorizontal: 8,
  },
});

export default ResetPasswordScreen;
