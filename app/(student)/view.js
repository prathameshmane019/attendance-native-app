import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { DataTable } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import AuthContext from '../AuthContext';
import { Card, Button, Paragraph } from 'react-native-paper';
const StudentAttendanceScreen = () => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const [studentId, setStudentId] = useState("");
    const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
    const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 15)));
    const [endDate, setEndDate] = useState(new Date());
    const API_URL = process.env.API_URL

    useEffect(() => {
        setStudentId(user?.id);
    }, [user]);

    
  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (userRole) => {
    if (userRole !== 'student') {
      router.replace('/(auth)/login');
    }
  };
    useEffect(() => {
        if (studentId) {
            fetchAttendance(studentId, startDate, endDate);
        }
    }, [studentId, startDate, endDate]);

    const fetchAttendance = async (studentId, startDate, endDate) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${API_URL}/api/attendance-reports`,
                {
                    params: {
                        studentId,
                        startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
                        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined
                    }
                }
            );
            setAttendanceData(response.data);
        } catch (err) {
            setError("Failed to fetch attendance data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderStudentAttendance = () => {
        if (!attendanceData) return <Card><Card.Title>No data available</Card.Title></Card>;
    
        const totalLectures = attendanceData.reduce((sum, subject) => sum + subject.totalLectures, 0);
        const totalPresent = attendanceData.reduce((sum, subject) => sum + subject.presentCount, 0);
    
        return (
            <Card style={styles.card}>
                <Card.Title title="Attendance Summary" />
                <Card.Content>
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title style={styles.cellSubject}>Subject</DataTable.Title>
                            <DataTable.Title style={styles.cellTotal} numeric>Total</DataTable.Title>
                            <DataTable.Title style={styles.cellPresent} numeric>Present</DataTable.Title>
                            <DataTable.Title style={styles.cellPercentage} numeric>Attendance %</DataTable.Title>
                        </DataTable.Header>
    
                        {attendanceData.map((subject, index) => (
                            <DataTable.Row key={index}>
                                <DataTable.Cell style={styles.cellSubject}>{subject.name}</DataTable.Cell>
                                <DataTable.Cell style={styles.cellTotal} numeric>{subject.totalLectures}</DataTable.Cell>
                                <DataTable.Cell style={styles.cellPresent} numeric>{subject.presentCount}</DataTable.Cell>
                                <DataTable.Cell style={styles.cellPercentage} numeric>{((subject.presentCount / subject.totalLectures) * 100).toFixed(2)}%</DataTable.Cell>
                            </DataTable.Row>
                        ))}
    
                        <DataTable.Row style={styles.totalRow}>
                            <DataTable.Cell style={styles.cellSubject}>Total</DataTable.Cell>
                            <DataTable.Cell style={styles.cellTotal} numeric>{totalLectures}</DataTable.Cell>
                            <DataTable.Cell style={styles.cellPresent} numeric>{totalPresent}</DataTable.Cell>
                            <DataTable.Cell style={styles.cellPercentage} numeric>{((totalPresent / totalLectures) * 100).toFixed(2)}%</DataTable.Cell>
                        </DataTable.Row>
                    </DataTable>
                </Card.Content>
            </Card>
        );
    };
    
    
    const onStartDateChange = (event, selectedDate) => {
        setStartDatePickerVisible(false);
        if (selectedDate) setStartDate(selectedDate);
    };

    const onEndDateChange = (event, selectedDate) => {
        setEndDatePickerVisible(false);
        if (selectedDate) setEndDate(selectedDate);
    };

    if (loading) {
        return <Text style={styles.loadingText}>Loading...</Text>;
    }

    if (error) {
        // return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Attendance Report</Text>
            <View style={styles.datePickerContainer}>
                <TouchableOpacity onPress={() => setStartDatePickerVisible(true)} style={styles.dateButton}>
                    <Text>Start: {startDate.toDateString()}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setEndDatePickerVisible(true)} style={styles.dateButton}>
                    <Text>End: {endDate.toDateString()}</Text>
                </TouchableOpacity>
                </View>
            {isStartDatePickerVisible && (
                <DateTimePicker
                    value={startDate}
                    mode={'date'}
                    display="default"
                    onChange={onStartDateChange}
                />
            )}
            {isEndDatePickerVisible && (
                <DateTimePicker
                    value={endDate}
                    mode={'date'}
                    display="default"
                    onChange={onEndDateChange}
                />
            )}
            {attendanceData && renderStudentAttendance()}
            <Button mode="contained" style={styles.refreshButton} onPress={() => fetchAttendance(studentId, startDate, endDate)}>
                Refresh Data
            </Button>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 2, 
        backgroundColor: '#f5f5f5'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    card: {
        marginBottom: 15
    },
    totalRow: {
        backgroundColor: '#efe7ff'
    },
    errorText: {
        color: 'red', 
        textAlign: 'center',
        marginTop: 20
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 16
    },
    dateButton: {
        padding: 8,
        backgroundColor: '#efe7ff',
        borderRadius: 10
    },
    refreshButton: {
        margin: 16
    },
    cellSubject: {
        flex: 1,
    },
    cellTotal: {
        flex: 1/2
    },
    cellPresent: {
        flex: 1/2
    },
    cellPercentage: {
        flex: 1
    }
});

export default StudentAttendanceScreen;
