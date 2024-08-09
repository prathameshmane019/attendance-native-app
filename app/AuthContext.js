import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

const AuthContext = createContext();
const API_URL = process.env.API_URL
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 const router = useRouter();
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await axios.get(`${API_URL}/api/applogin`);
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password, role) => {
    try {
      const endpoint =  '/api/applogin';
      const { data } = await axios.post(`${API_URL}/api/applogin`, { _id: username, password,role });
      await AsyncStorage.setItem('token', data.token);
      const userData = data.user;
      setUser(userData);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      await loadUser();
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.msg || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userData');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      router.replace("/(auth)/login")
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;