import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title, Card, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FacultyMenuScreen() {
  const router = useRouter();
  const [faculty, setFaculty] = useState(null);

  useEffect(() => {
    let isMounted = true; // To prevent state updates if component is unmounted

    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData && isMounted) {
          const parsedUserData = JSON.parse(userData);
          setFaculty(parsedUserData);
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false; 
    };
  }, []);

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Faculty Menu</Title>
      <Card style={styles.card}>
        <Card.Content>
          {faculty && (
            <View>
              <Text style={styles.info}>Name: {faculty.name}</Text>
              <Text style={styles.info}>Department: {faculty.department}</Text>
              <Text style={styles.info}>Subjects: {faculty.subjects?.join(', ')}</Text>
            </View>
          )}
          <Button
            mode="contained"
            onPress={() => router.push('/(faculty)/take-attendance')}
            style={styles.button}
          >
            Take New Attendance
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push('/(faculty)/update-attendance')}
            style={styles.button}
          >
            Update Attendance
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 20,
  },
  button: {
    marginVertical: 10,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
});
