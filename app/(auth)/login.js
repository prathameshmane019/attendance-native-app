import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import AuthContext from '../AuthContext';
import { TextInput, Button, Surface, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('faculty');
  const [isLoading, setIsLoading] = useState(false);
  const { login, user, loading: authLoading } = useContext(AuthContext);
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (user && !authLoading) {
      redirectUser(user.role);
    }
  }, [user, authLoading]);

  const redirectUser = (userRole) => {
    if (userRole === 'faculty') {
      router.replace('/(faculty)');
    } else if (userRole === 'student') {
      router.replace('/(student)/view');
    }
  };

  const handleCancel = () => {
    setPassword("");
    setUsername("");
  }

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(username, password, role);
    } catch (error) {
      alert('Login Failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || user) return null;

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
            <Text style={styles.title}>Welcome Back</Text>
            <View style={styles.roleToggle}>
              <Button
                mode={role === 'faculty' ? 'contained' : 'outlined'}
                onPress={() => setRole('faculty')}
                style={[styles.roleButton, role === 'faculty' && styles.activeRoleButton]}
                disabled={isLoading}
              >
                Faculty
              </Button>
              <Button
                mode={role === 'student' ? 'contained' : 'outlined'}
                onPress={() => setRole('student')}
                style={[styles.roleButton, role === 'student' && styles.activeRoleButton]}
                disabled={isLoading}
              >
                Student
              </Button>
            </View>
            <TextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              disabled={isLoading}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              disabled={isLoading}
            />
            <Link href="/ResetPasswordScreen">
              <Text style={styles.resetLink}>Reset Password</Text>
            </Link>
            <View style={styles.bottomAction}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                icon={({ size, color }) => (
                  isLoading ? 
                  <ActivityIndicator color={color} size={size} /> :
                  <MaterialCommunityIcons name="login" size={size} color={color} />
                )}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
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
    elevation: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    minHeight: 420,
  },
  illustration: {
    width: 300,
    height: 300,
    marginVertical:40,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  roleToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'center',
  },
  roleButton: {
    marginHorizontal: 5,
    flex: 1,
    borderRadius: 25,
  },
  activeRoleButton: {
    backgroundColor: '#6a11cb',
  },
  input: {
    width: '100%',
    marginBottom: 20,
  },
  resetLink: {
    color: '#6a11cb',
    alignSelf: 'center',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  loginButton: {
    marginTop: 10,
    width: '50%',
    paddingVertical: 5,
    backgroundColor: '#6a11cb',
    borderRadius: 25,
    marginHorizontal: 8,
  },
  cancelButton: {
    marginTop: 10,
    width: '50%',
    paddingVertical: 3,
    marginHorizontal: 8,
    borderRadius: 25,
  },
  bottomAction: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 2,
  }
});

export default LoginScreen;
