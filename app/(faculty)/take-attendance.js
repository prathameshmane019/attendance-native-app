import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, FlatList, ScrollView } from 'react-native';
import { Provider as PaperProvider, Card, Title, Paragraph, Button, Checkbox, List, Divider, Portal, Dialog } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import getUserData from '../utils/getUser';

export default function AttendanceApp() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedContents, setSelectedContents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subjectDetails, setSubjectDetails] = useState(null);
  const [batches, setBatches] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [availableSessions, setAvailableSessions] = useState([]);
  const [selectedSessions, setSelectedSessions] = useState([]);

  const API_URL = process.env.API_URL;

  useEffect(() => {
    const loadProfile = async () => {
      const userData = await getUserData();
      setProfile(userData);
    };
    loadProfile();
  }, []);

  const subjectOptions = profile ? profile.subjects.map(sub => ({ _id: sub, name: sub })) : [];

  useEffect(() => {
    if (selectedSubject) {
      fetchSubjectData();
      fetchAvailableSessions(selectedSubject, selectedBatch);

    }
  }, [selectedSubject, selectedBatch]);

  const fetchAvailableSessions = async (subjectId, batchId) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get(`${API_URL}/api/utils/available-sessions?subjectId=${subjectId}&batchId=${batchId || ''}&date=${today}`);
      setAvailableSessions(response.data.availableSessions);
    } catch (error) {
      console.error('Error fetching available sessions:', error);
      console.log(error)
    }
  };

  const handleSessionToggle = (session) => {
    setSelectedSessions(prevSessions => {
      if (prevSessions.includes(session)) {
        return prevSessions.filter(s => s !== session);
      } else {
        return [...prevSessions, session];
      }
    });
    console.log(selectedSessions);
    
  };

  const fetchSubjectData = async () => {
    try {
      if (selectedSubject) {
        setSelectAll(false)
        const response = await axios.get(`${API_URL}/api/utils/subjectBatch?subjectId=${selectedSubject}`);
        const { subject } = response.data;
        setSubjectDetails(subject);
        setBatches(subject.batch);
      }
    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  useEffect(() => {
    if (selectedSubject && selectedDate &&  selectedSessions) {
      console.log(selectedSessions);
      if (subjectDetails && (subjectDetails.subType === 'practical' || subjectDetails.subType === 'tg')) {
        if (selectedBatch) {
          fetchSubjectDetails();
        }
      } else if (selectedSubject &&  selectedSessions) {
        console.log(selectedSessions,selectedSubject);
        fetchSubjectDetails();

      }
    }
  }, [selectedSubject, selectedDate, selectedSessions, selectedBatch, subjectDetails]);

  const fetchSubjectDetails = async () => {
    if (selectedSubject &&  selectedSessions && selectedDate) {
      try {
        setFetching(true);
        const response = await axios.get(`${API_URL}/api/utils/batches?_id=${selectedSubject}&batchId=${selectedBatch || ''}`);

        const { students, attendanceRecord } = response.data;
        console.log(response.data);
        
        setStudents(students ? students.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber)) : []);
        

        if (attendanceRecord) {
          setSelectedKeys(new Set(attendanceRecord.records.filter(r => r.status === "present").map(r => r.student)));
          setSelectedContents(attendanceRecord.contents || []);
        } else {
          setSelectedKeys(new Set());
          setSelectedContents([]);
        }
      } catch (error) {
        console.error('Error fetching subject details:', error);
      } finally {
        setFetching(false);
      }
    }
  };

  const handleTakeAttendance = () => {
    setIsTableVisible(true);
  };

  const updateAttendance = async () => {
    if (selectedSubject === "Subject") {
      Alert.alert("Error", "Please select a subject");
      return;
    }

    if (!selectedSessions) {
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
      date: selectedDate.toISOString().split("T")[0],
      session: selectedSessions,
      attendanceRecords,
      contents: selectedContents,
      batchId: selectedBatch
    };

    setLoading(true);
    try {
      const response = await axios.put(`${API_URL}/api/attendance`, attendanceData);
      console.log('Attendance updated successfully:', response.data);
      setSuccessModalVisible(true);
      fetchSubjectDetails(selectedSubject);
    } catch (error) {
      console.error('Failed to update attendance:', error);
      Alert.alert("Error", "Failed to update attendance");
    } finally {
      setLoading(false);
      setSelectedSubject("Subject");
      setSelectedBatch(null);
      setIsTableVisible(false);
      setSelectedSessions([]);
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

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideDatePicker();
  };

  const renderItem = ({ item }) => (
    <View>
      <Card style={styles.card}>
        <Card.Content>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sessionContainer}>
              {availableSessions.map(session => (
                <Checkbox.Item
                  key={session}
                  label={`${session}`}
                  status={selectedSessions.includes(session) ? 'checked' : 'unchecked'}
                  onPress={() => handleSessionToggle(session)}
                  style={styles.sessionCheckbox}
                  labelStyle={styles.sessionLabel}
                />
              ))}
            </View>
          </ScrollView>
          <Title style={styles.sectionTitle}>Select Date</Title>
          <Button mode="outlined" onPress={showDatePicker} style={styles.date}>
            {selectedDate.toDateString()}
          </Button>

          <Button mode="contained"
            labelStyle={styles.updateButtonLabel} onPress={handleTakeAttendance} style={styles.updateButton}>
            Take Attendance
          </Button>
        </Card.Content>
      </Card>

      {isTableVisible && (
        <>
          <List.Accordion
            title="Course Content"
            left={props => <List.Icon {...props} icon="book" />}
          >
            <Card style={styles.card}>
              <Card.Content>
                {subjectDetails && subjectDetails.content && subjectDetails.content.map((content) => (
                  <List.Item
                    key={content._id}
                    title={content.title}
                    description={content.description}
                    right={() => (
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
          </List.Accordion>
          <List.Accordion
            title="Students List"
            left={props => <List.Icon {...props} icon="account-group" />}
          >
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.headerRow}>
                  <Text style={[styles.rollNumber, styles.headerText]}>Roll No.</Text>
                  <Text style={[styles.studentName, styles.headerText]}>Name</Text>
                  <Text style={styles.headerText}>Present</Text>
                </View>
                <Checkbox.Item
                  label="Select All"
                  status={selectAll ? 'checked' : 'unchecked'}
                  onPress={handleSelectAll}
                  style={styles.selectAll}
                />
                <FlatList
                  data={students}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item: student }) => (
                    <View style={styles.studentRow}>
                      <Text style={styles.rollNumber}>{student.rollNumber}</Text>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Checkbox.Android
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
                        color="#6200ee"
                      />
                    </View>
                  )}
                  ListFooterComponent={() => (
                    <View style={styles.summary}>
                      <Text style={styles.summaryItem}>Total: {students.length}</Text>
                      <Text style={styles.summaryItem}>Present: {selectedKeys.size}</Text>
                      <Text style={styles.summaryItem}>Absent: {students.length - selectedKeys.size}</Text>
                    </View>
                  )}
                  ItemSeparatorComponent={() => <Divider />}
                />
              </Card.Content>
            </Card>
          </List.Accordion>
          <Button
            mode="contained"
            onPress={updateAttendance}
            style={styles.updateButton}
            labelStyle={styles.updateButtonLabel}
            loading={loading}
            disabled={loading}
          >
            Submit Attendance
          </Button>
        </>
      )}

      {fetching && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
    </View>
  );

  return (
    <PaperProvider>
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={renderItem}
        keyExtractor={item => item.key}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />
      <Portal>
        <Dialog visible={successModalVisible} onDismiss={() => setSuccessModalVisible(false)}>
          <Dialog.Content>
            <Title>Success!</Title>
            <Paragraph>Attendance updated successfully</Paragraph>
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
    margin: 12,
    elevation: 4,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rollNumber: {
    flex: 1,
    fontSize: 16,
  },
  picker: {
    marginVertical: 5,
    borderBottomWidth: 3,
  },
  sessionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  sessionCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 0,
    padding: 0,
    marginVertical: 0,
    height: 40, // Adjust this value to make checkboxes more compact vertically
  },
  sessionLabel: {
    fontSize: 14, // Reduce font size if needed
    marginLeft: -8, // Adjust this value to move label closer to checkbox
  },
  button: {
    margin: 10,
    backgroundColor: '#6a11cb',
    color: "#f0f0f0"
  },
  date: {
    marginVertical: 10,
    marginHorizontal: "auto",
    justifyContent: "center"
  },
  sectionTitle: {
    marginVertical: 16,
  },
  loadingIndicator: {
    margin: 16,
  },
  selectAll: {
    paddingLeft: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 8,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 8,
  },
  rollNumber: {
    flex: 1,
    marginRight: 8,
  },
  studentName: {
    flex: 3,
  },
  headerText: {
    fontWeight: 'bold',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  summaryItem: {
    fontWeight: 'bold',
  },
  updateButton: {
    margin: 10,
    backgroundColor: '#6a11cb',
  },
  updateButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

});