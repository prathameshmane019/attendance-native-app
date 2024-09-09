import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, FlatList, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider, Card, Title, Paragraph, Button, Checkbox, List, Divider, Portal, Dialog, IconButton } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import getUserData from '../utils/getUser';

export default function AttendanceApp() {
  const [selectedSubject, setSelectedSubject] = useState("Subject");
  const [isTableVisible, setIsTableVisible] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [selectedSession, setSelectedSession] = useState('');
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [pointsDiscussed, setPointsDiscussed] = useState(['']);

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
    if (selectedSubject) {
      fetchSubjectData();
    }
  }, [selectedSubject]);



  const fetchSubjectData = async () => {
    try {
      if (selectedSubject) {
        setSelectAll(false)
        const response = await axios.get(`${API_URL}/api/utils/subjectBatch?subjectId=${selectedSubject}`);
        const { subject } = response.data;
        console.log(subject);

        setSubjectDetails(subject);
        console.log("subject details ", subjectDetails);
        setBatches(subject.batch);
      }

    } catch (error) {
      console.error('Error fetching subject data:', error);
    }
  };

  useEffect(() => {
    if (selectedSubject && selectedDate && selectedSession) {
      if (subjectDetails && (subjectDetails.subType === 'practical' || subjectDetails.subType === 'tg')) {
        if (selectedBatch) {
          fetchSubjectDetails();
        }
      } else if (selectedSubject && selectedSession) {
        fetchSubjectDetails();
      }
    }
  }, [selectedSubject, selectedDate, selectedSession, selectedBatch, subjectDetails]);
  const fetchSubjectDetails = async () => {
    if (selectedSubject && selectedSession && selectedDate) {
      try {
        console.log(selectedSession, selectedSubject, selectedDate);

        setFetching(true);
        const response = await axios.get(`${API_URL}/api/update`, {
          params: {
            subjectId: selectedSubject,
            date: selectedDate.toISOString().split("T")[0],
            session: selectedSession, // Assuming you want to use the first selected session
            batchId: subjectDetails && subjectDetails.subType !== 'theory' ? selectedBatch : undefined
          }
        });

        const { students, attendanceRecord } = response.data;
        console.log('Fetched data:', response.data);

        setStudents(students ? students.sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber)) : []);
        setAttendanceRecord(attendanceRecord);

        if (attendanceRecord) {
          setSelectedKeys(new Set(attendanceRecord.records.filter(r => r.status === "present").map(r => r.student)));
          setSelectedContents(attendanceRecord.contents || []); // This should now be an array of content _ids
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

    if (!selectedSession) {
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
      session: selectedSession,
      attendanceRecords,
      batchId: selectedBatch,
      ...(subjectDetails.subType === 'tg'
        ? { pointsDiscussed: pointsDiscussed.filter(point => point.trim() !== '') }
        : { contents: selectedContents })
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
      setSelectedSession('');
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

  const sortedStudents = students.slice().sort((a, b) => {
    // Extract the numeric part of the roll number
    const aNumericPart = parseInt(a.rollNumber.replace(/\D/g, ''), 10);
    const bNumericPart = parseInt(b.rollNumber.replace(/\D/g, ''), 10);

    // Compare the numeric parts of the roll numbers
    if (aNumericPart !== bNumericPart) {
      return aNumericPart - bNumericPart;
    } else {
      // If the numeric parts are the same, compare the entire roll numbers as strings
      return a.rollNumber.localeCompare(b.rollNumber);
    }
  });

  const renderContent = () => (
    <View style={styles.container}>
      <List.Section>
        <Card style={styles.card}>
          <Card.Content >
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

            <Title style={styles.sectionTitle}>Select Session</Title>
            <Picker
              selectedValue={selectedSession}
              onValueChange={(itemValue) => setSelectedSession(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Session" value="" />
              {sessions.map(session => (
                <Picker.Item key={session} label={`Session ${session}`} value={session} />
              ))}
            </Picker>

            <Title style={styles.sectionTitle}>Select Date</Title>
            <Button mode="outlined" onPress={showDatePicker} style={styles.date}>
              {selectedDate.toDateString()}
            </Button>

            <Button mode="contained"
              labelStyle={styles.updateButtonLabel} onPress={handleTakeAttendance} style={styles.button}>
              Take Attendance
            </Button>
          </Card.Content>
        </Card>

        {isTableVisible && (
          <>
            {subjectDetails && subjectDetails.subType === 'tg' ? (
              <List.Accordion
                title="TG Session Points"
                left={props => <List.Icon {...props} icon="clipboard-text" />}
              >
                <Card style={styles.card}>
                  <Card.Content >
                    {pointsDiscussed.map((point, index) => (
                      <View key={index} style={styles.pointInputContainer}>
                        <TextInput
                          value={point}
                          onChangeText={(text) => {
                            const newPoints = [...pointsDiscussed];
                            newPoints[index] = text;
                            setPointsDiscussed(newPoints);
                          }}
                          style={styles.pointInput}
                          placeholder={`Point ${index + 1}`}
                        />
                        <IconButton
                          icon="close-circle"
                          size={24}
                          onPress={() => {
                            const newPoints = pointsDiscussed.filter((_, i) => i !== index);
                            setPointsDiscussed(newPoints.length ? newPoints : ['']);
                          }}
                        />
                      </View>
                    ))}
                    <Button
                      mode="contained"
                      style={styles.button}
                      onPress={() => setPointsDiscussed([...pointsDiscussed, ''])}
                      labelStylestyle={styles.updateButtonLabel}
                    >
                      Add Point
                    </Button>
                  </Card.Content>
                </Card>
              </List.Accordion>
            ) : (
              <List.Accordion
                title="Course Content"
                left={props => <List.Icon {...props} icon="book" />}
              >
                <Card style={styles.card}>
                  <Card.Content style={styles.cardContent} >
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
            )}

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
                    data={sortedStudents}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item: student }) => (
                      <TouchableOpacity
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
                        style={styles.studentRow}
                      >
                        <Text style={styles.rollNumber}>{student.rollNumber}</Text>
                        <Text style={styles.studentName}>{student.name}</Text>
                        <Checkbox.Android
                          status={selectedKeys.has(student._id) ? 'checked' : 'unchecked'}
                          color="#6200ee"
                        />
                      </TouchableOpacity>
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
              style={styles.button}
              loading={loading}
              disabled={loading}
              labelStyle={styles.updateButtonLabel}
            >
              Update Attendance
            </Button>
          </>
        )}
      </List.Section>

      {fetching && <ActivityIndicator size="large" style={styles.loadingIndicator} />}
    </View>
  );
  return (
    <PaperProvider>
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => renderContent()}
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
    flex: 3,
    backgroundColor: '#f0f0f0',

  },
  card: {
    margin: 10,
    padding: 1, // Remove any default padding
  },
  cardContent: {
    paddingHorizontal: 0, // Remove horizontal padding
  },
  picker: {
    marginVertical: 5,
    borderBottomWidth: 3,

  },
  sessionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  updateButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },

  sectionTitle: {
    marginVertical: 16,
  },
  loadingIndicator: {
    margin: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 1,
    width: '100%',
    justifyContent: 'space-between',

  },
  rollNumber: {
    maxWidth: 70, // Adjust as needed
    marginRight: 10,
  },
  studentName: {
    flex: 3,
    fontSize: 16,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  summaryItem: {
    fontWeight: 'bold',
    fontSize: 14,
  },

  pointInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    margin: 'auto'
  },
  pointInput: {
    flex: 1,
    width: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 6,
    fontSize: 16,
  },
});