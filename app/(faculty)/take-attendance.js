import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { Provider as PaperProvider, Card, Title, Paragraph, Button, Checkbox, List, Divider, Modal, Portal, Dialog } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { FlatList } from 'react-native';
import getUserData from '../utils/getUser';

export default function AttendanceApp() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState([]);
  const [selectedContents, setSelectedContents] = useState([]);
  const [sessions] = useState([1, 2, 3, 4, 5, 6, 7]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [fetching, setFetching] = useState(false);
  const API_URL = process.env.API_URL

  console.log(API_URL);
  
  useEffect(() => {
    const loadProfile = async () => {
      const userData = await getUserData();
      setProfile(userData);
    };
    loadProfile();
  }, []);

  const subjectOptions = profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : [];

  useEffect(() => {
    if (selectedSubject !== "Subject") {
      fetchSubjectDetails(selectedSubject);
    }
  }, [selectedSubject, selectedBatch]);

  const fetchSubjectDetails = async (subjectId) => {
    setFetching(true);
    try {
      const response = await axios.get(`${API_URL}/api/utils/batches?_id=${subjectId}&batchId=${selectedBatch || ''}`);
      const { subject, batches, students } = response.data;
      setSubjectDetails(subject);
      setBatches(batches || []);
      setStudents(students ? students.sort((a, b) => Number(a.rollNumber) - Number(b.rollNumber)) : []);
    } catch (error) {
      console.error('Error fetching subject details:', error);
      // Alert.alert("Error", "Failed to fetch subject details");
    } finally {
      setFetching(false);
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  const submitAttendance = async () => {
    if (selectedSubject === "Subject") {
      Alert.alert("Error", "Please select a subject");
      return;
    }

    if (!selectedSession.length) {
      Alert.alert("Error", "Please select a session");
      return;
    }

    let presentStudentIds = Array.from(selectedKeys);
    const attendanceRecords = students.map(student => ({
      student: student._id,
      status: presentStudentIds.includes(student._id) ? 'present' : 'absent'
    }));

    const attendanceData = {
      subject: selectedSubject,
      session: selectedSession,
      attendanceRecords,
      contents: selectedContents,
      batchId: selectedBatch
    };

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/attendance`, attendanceData);
      console.log('Attendance submitted successfully:', response.data);
      setSuccessModalVisible(true);
    } catch (error) {
      console.error('Failed to submit attendance:', error);
      Alert.alert("Error", "Failed to submit attendance");
    } finally {
      setLoading(false);
      setSelectedSubject("Subject");
      setSelectedBatch(null);
      setIsTableVisible(false);
      setSelectedSession([]);
      setSelectedKeys(new Set());
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedKeys(new Set(students.map(student => student._id)));
    } else {
      setSelectedKeys(new Set());
    }
  };

  return (
    <PaperProvider>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Select Options</Title>
            <Picker
              selectedValue={selectedSubject}
              onValueChange={(itemValue) => setSelectedSubject(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Subject" value="Subject" />
              {subjectOptions.map((option) => (
                <Picker.Item key={option._id} label={option.name} value={option._id} />
              ))}
            </Picker>

            {subjectDetails && batches.length > 0 && (
              <Picker
                selectedValue={selectedBatch}
                onValueChange={(itemValue) => setSelectedBatch(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Batch" value={null} />
                {batches.map((batch) => (
                  <Picker.Item key={batch} label={`Batch ${batch}`} value={batch} />
                ))}
              </Picker>
            )}
            <Title style={styles.sectionTitle}>Select Sessions</Title>
            <View style={styles.sessionContainer}>
              {sessions.map(session => (
                <Checkbox.Item
                  key={session}
                  label={session.toString()}
                  status={selectedSession.includes(session.toString()) ? 'checked' : 'unchecked'}
                  onPress={() => {
                    setSelectedSession(prev =>
                      prev.includes(session.toString())
                        ? prev.filter(s => s !== session.toString())
                        : [...prev, session.toString()]
                    );
                  }}
                />
              ))}
            </View>

            <Button mode="contained" onPress={handleTakeAttendance} style={styles.button}>
              Take Attendance
            </Button>
          </Card.Content>
        </Card>

        {isTableVisible && (
          <>
           <Card style={styles.card}>
  <Card.Content>
    <Title>Course Content</Title>
    {subjectDetails && subjectDetails.content && subjectDetails.content.map((content) => (
      <List.Item
        key={content._id}  // Using _id as the key
        title={content.title}
        description={content.description}
        left={() => (
          <Checkbox.Android
            status={selectedContents.includes(content._id) || content.status === "covered" ? 'checked' : 'unchecked'}
            onPress={() => {
              setSelectedContents(prev =>
                prev.includes(content._id)
                  ? prev.filter(item => item !== content._id)
                  : [...prev, content._id]
              );
            }}
            disabled={content.status === 'covered'}
          />
        )}
      />
    ))}
  </Card.Content>
</Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title>Students List</Title>
                <FlatList
                  data={students}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item: student }) => (
                    <Checkbox.Item
                      label={`${student.rollNumber} - ${student.name}`}
                      status={selectedKeys.has(student._id) ? 'checked' : 'unchecked'}
                      onPress={() => {
                        setSelectedKeys(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(student._id)) {
                            newSet.delete(student._id);
                          } else {
                            newSet.add(student._id);
                          }
                          return newSet;
                        });
                      }}
                    />
                  )}
                  ListHeaderComponent={() => (
                    <Checkbox.Item
                      label="Select All"
                      status={selectAll ? 'checked' : 'unchecked'}
                      onPress={handleSelectAll}
                    />
                  )}
                  ItemSeparatorComponent={() => <Divider />}
                />
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              onPress={submitAttendance}
              style={styles.button}
              loading={loading}
              disabled={loading}
            >
              Submit Attendance
            </Button>
          </>
        )}
        {fetching && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
      </ScrollView>

      <Portal>
        <Dialog visible={successModalVisible} onDismiss={() => setSuccessModalVisible(false)}>
          <Dialog.Content>
            <Title>Success!</Title>
            <Paragraph>Attendance submitted successfully</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSuccessModalVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  card: {
    margin: 16,
  },
  picker: {
    marginVertical: 8,
  },
  sessionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  button: {
    margin: 16,
    backgroundColor: '#6a11cb',
    color:'#f0f0f0'
  },
  sectionTitle: {
    marginVertical: 16,
  },
  loadingIndicator: {
    margin: 16,
  },
});
