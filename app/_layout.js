import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from './AuthContext';
import LogoutButton from './components/logout';
import { Provider as PaperProvider } from "react-native-paper";
import { customTheme } from './theme';
export default function Layout() {
  return (
    <AuthProvider>
      <PaperProvider  theme={customTheme}>
        <Stack
          screenOptions={{
            headerRight: () => <LogoutButton />,
            headerTintColor: '#fff'
             // This hides the header for all screens
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Home',
            headerShown:false
           }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Login' ,
            headerShown:false
          }} />
          <Stack.Screen name="(faculty)/index" options={{ title: 'Faculty Menu', headerStyle: {
              backgroundColor: '#6a11cb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
           }} />
          <Stack.Screen name="(faculty)/take-attendance" options={{ title: 'Take Attendance',
            headerStyle: {
              backgroundColor: '#6a11cb',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
           }} />
          <Stack.Screen name="(faculty)/update-attendance" options={{ title: 'Update Attendance',headerStyle: {
            backgroundColor: '#6a11cb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          }, }} />
          <Stack.Screen name="(student)/view" options={{ title: 'Display Attendance' ,headerStyle: {
            backgroundColor: '#6a11cb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },}} />
          <Stack.Screen name="(auth)/ResetPasswordScreen" options={{ title: 'Reset Password', 
            headerShown:false
          }} />
        </Stack>
      </PaperProvider>
    </AuthProvider>
  );
}