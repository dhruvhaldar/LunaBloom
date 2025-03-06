import { useState, useEffect } from 'react';
import { StyleSheet, Platform, TouchableOpacity, TextInput, ScrollView, Alert, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import DatePicker from 'react-native-date-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'react-native';

export default function HomeScreen() {
  const [lastPeriod, setLastPeriod] = useState(new Date());
  const [cycleLength, setCycleLength] = useState('28');
  const [predictedPeriods, setPredictedPeriods] = useState<Date[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleCycleLengthChange = (text) => {
    // Remove any non-numeric characters
    const filteredText = text.replace(/[^0-9]/g, '');

    // Parse the filtered text to an integer
    let number = parseInt(filteredText, 10);

    // Clamp the number to a maximum of 120
    if (number > 120) {
      number = 120;
    }

    // If the parsed number is NaN, set it to an empty string
    if (isNaN(number)) {
      setCycleLength('');
      return;
    }

    // Show an alert if the number is less than 21 and more than 7, and the input is not empty
    if (number < 21 && filteredText !== '' && number > 7) {
      Alert.alert(
        "Attention",
        "A cycle length shorter than 21 days can be a sign of frequent ovulation or other hormonal imbalances. Please consult a doctor for advice.",
        [{ text: "OK" }]
      );
    }

    // Show an alert if the number exceeds 35
    if (number > 35) {
      Alert.alert(
        "Attention",
        "A cycle length greater than 35 days might indicate a condition like polycystic ovary syndrome (PCOS). Please consult a doctor for advice.",
        [{ text: "OK" }]
      );
    }

    // Update the state with the new value
    setCycleLength(number.toString());
  };

  const symptomsList = [
    'Cramps', 'Bloating', 'Headache', 
    'Fatigue', 'Mood Swings', 'Tender Breasts'
  ];

  const calculatePredictions = () => {
    const predictions = [];
    const predictionStart = new Date(lastPeriod);
    
    for (let i = 0; i < 3; i++) {
      const nextDate = new Date(predictionStart);
      nextDate.setDate(predictionStart.getDate() + Number(cycleLength));
      predictions.push(nextDate);
      predictionStart.setDate(predictionStart.getDate() + Number(cycleLength));
    }
    
    setPredictedPeriods(predictions);
  };

  useEffect(() => {
    calculatePredictions();
  }, [lastPeriod, cycleLength]);

  const logPeriod = async () => {
    try {
      const entry = {
        date: new Date().toISOString(),
        lastPeriod,
        cycleLength,
        selectedSymptoms,
        notes,
      };
  
      // Retrieve existing entries
      const existingEntries = await AsyncStorage.getItem('periodEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
  
      // Add the new entry
      entries.push(entry);
  
      // Save back to AsyncStorage
      await AsyncStorage.setItem('periodEntries', JSON.stringify(entries));
  
      // Clear current inputs
      setSelectedSymptoms([]);
      setNotes('');
      Alert.alert('Success', 'Your period start has been logged.');
    } catch (error) {
      console.error('Error saving period entry:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image source={require('@/assets/images/partial-react-logo.png')} style={styles.reactLogo}/>
      }>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.header}>LunaBloom Cycle Tracker</ThemedText>

        {/* Cycle Configuration */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Cycle Settings</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText>Last Period Start:</ThemedText>
            <TouchableOpacity 
              onPress={() => setDatePickerOpen(true)}
              style={styles.dateButton}
            >
              <ThemedText style={styles.dateText}>
                {lastPeriod.toLocaleDateString()}
              </ThemedText>
            </TouchableOpacity>
            <DatePicker
              modal
              datePickerOpen={datePickerOpen}
              date={date}
              onConfirm={(date: any) => {
                setDatePickerOpen(false);
                setLastPeriod(date);
              }}
              onCancel={() => {
                setDatePickerOpen(false);
              }}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Cycle Length (days):</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cycleLength}
              onChangeText={handleCycleLengthChange}
            />
          </ThemedView>
        </ThemedView>

        {/* Predictions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Predicted Periods</ThemedText>
          {predictedPeriods.map((date, index) => (
            <ThemedView key={index} style={styles.predictionItem}>
              <ThemedText>{date.toLocaleDateString()}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Symptom Tracker */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Today's Symptoms</ThemedText>
          <ThemedView style={styles.symptomsGrid}>
            {symptomsList.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  selectedSymptoms.includes(symptom) && styles.selectedSymptom
                ]}
                onPress={() => {
                  setSelectedSymptoms(prev =>
                    prev.includes(symptom)
                      ? prev.filter(s => s !== symptom)
                      : [...prev, symptom]
                  );
                }}
              >
                <ThemedText style={selectedSymptoms.includes(symptom) && styles.symptomText}>
                  {symptom}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Notes */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Notes</ThemedText>
          <TextInput
            style={styles.notesInput}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Record any additional notes..."
            placeholderTextColor="#888"
          />
        </ThemedView>

        <TouchableOpacity style={styles.logButton} onPress={logPeriod}>
          <ThemedText style={styles.logButtonText}>Log Period Start</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: 100,
    textAlign: 'center',
  },
  dateButton: {
    padding: 8,
    borderRadius: 8,
  },
  dateText: {
    color: '#6b46c1',
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  selectedSymptom: {
    backgroundColor: '#6b46c1',
  },
  symptomText: {
    color: 'white',
  },
  predictionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f0f4f8',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  logButton: {
    backgroundColor: '#6b46c1',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  logButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});