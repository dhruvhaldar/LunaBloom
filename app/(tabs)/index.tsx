import React, { useState, useEffect } from 'react';
import { StyleSheet, Platform, TouchableOpacity, TextInput, ScrollView, Alert, View, Text, useColorScheme } from 'react-native';
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
  const [open, setOpen] = useState(false);
  const colorScheme = useColorScheme();

  const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  const predictionBackgroundColor = colorScheme === 'dark' ? '#EE2D60' : '#f0f0f0';
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#ee2d60' : '#ee2d60';
  const symptomtextColor = colorScheme === 'dark' ? '#f0f0f0' : '#ee2d60';  
  const predictedtextColor = colorScheme === 'dark' ? '#444444' : '#413c58';
  const predictedsectionHeadingtextColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  const selectedSymptomBackgroundColor = colorScheme === 'dark' ? '#413c58' : '#ffdde2';
  const symptomButtonBorderColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

  const handleCycleLengthChange = (text) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    let number = parseInt(filteredText, 10);

    if (number > 120) {
      number = 120;
    }

    if (isNaN(number)) {
      setCycleLength('');
      return;
    }

    if (number < 21 && filteredText !== '' && number > 7) {
      Alert.alert(
        "Attention",
        "A cycle length shorter than 21 days can be a sign of frequent ovulation or other hormonal imbalances. Please consult a doctor for advice.",
        [{ text: "OK" }]
      );
    }

    if (number > 35) {
      Alert.alert(
        "Attention",
        "A cycle length greater than 35 days might indicate a condition like polycystic ovary syndrome (PCOS). Please consult a doctor for advice.",
        [{ text: "OK" }]
      );
    }

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
  
      const existingEntries = await AsyncStorage.getItem('periodEntries');
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
  
      entries.push(entry);
  
      await AsyncStorage.setItem('periodEntries', JSON.stringify(entries));
  
      setSelectedSymptoms([]);
      setNotes('');
      Alert.alert('Success', 'Your period start has been logged.');
    } catch (error) {
      console.error('Error saving period entry:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ffdde2', dark: '#ffdde2' }}
      headerImage={
        <Image source={require('@/assets/images/LunaBloom_adaptive.png')} style={styles.reactLogo}/>
      }>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={[styles.header, { color: textColor }]}>Period Tracker</ThemedText>

        {/* Cycle Configuration */}
        <ThemedView style={[styles.section]}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor , marginBottom: 10}}>Cycle Settings</ThemedText>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={{ color: textColor }}>Last Period Start:</ThemedText>
            <TouchableOpacity 
              onPress={() => setOpen(true)}
              style={[styles.dateButton, { borderColor: textColor }]} // Dynamically set borderColor
            >
              <ThemedText style={[styles.dateText, { color: textColor, borderColor: textColor }]}>
                {lastPeriod.toLocaleDateString()}
              </ThemedText>
            </TouchableOpacity>
            <DatePicker
              modal
              open={open}
              date={date}
              onConfirm={(date: any) => {
                setOpen(false);
                setLastPeriod(date);
              }}
              onCancel={() => {
                setOpen(false);
              }}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={{ color: textColor }}>Cycle Length (days):</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: textColor }]}
              keyboardType="numeric"
              value={cycleLength}
              onChangeText={handleCycleLengthChange}
            />
          </ThemedView>
        </ThemedView>

        {/* Symptom Tracker */}
        <ThemedView style={[styles.section]}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>Today's Symptoms</ThemedText>
          <ThemedView style={styles.symptomsGrid}>
            {symptomsList.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  { borderColor: symptomButtonBorderColor }, // Dynamically setting border color
                  selectedSymptoms.includes(symptom) && { backgroundColor: selectedSymptomBackgroundColor }
                ]}
                onPress={() => {
                  setSelectedSymptoms(prev =>
                    prev.includes(symptom)
                      ? prev.filter(s => s !== symptom)
                      : [...prev, symptom]
                  );
                }}
              >
                <ThemedText style={[{ color: symptomtextColor }, selectedSymptoms.includes(symptom) && styles.symptomText]}>
                  {symptom}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Notes */}
        <ThemedView style={[styles.section]}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>Notes</ThemedText>
          <TextInput
            style={[styles.notesInput, { color: textColor, borderColor: textColor }]}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Record any additional notes..."
            placeholderTextColor={colorScheme === 'dark' ? '#AAAAAA' : '#888'}
          />
        </ThemedView>

        <TouchableOpacity style={styles.logButton} onPress={logPeriod}>
          <ThemedText style={styles.logButtonText}>Log Period Start</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Predictions */}
      <ThemedView style={[styles.section]}>
          <ThemedText type="subtitle" style={{ color: predictedsectionHeadingtextColor, marginBottom: 10 }}>Predicted Periods</ThemedText>
          {predictedPeriods.map((date, index) => (
            <ThemedView key={index} style={[styles.predictionItem, { borderColor: textColor, borderWidth: 1 }]}>
              <ThemedText style={{ color: textColor  }}>{date.toLocaleDateString()}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  header: {
    marginTop: -16,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 12,
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
    borderWidth: 1,
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
    borderWidth: 1,
  },

  selectedSymptom: {
    fontWeight: 'bold',
  },
  predictionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    // backgroundColor: '#f0f4f8',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  logButton: {
    backgroundColor: '#413c58',
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  logButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reactLogo: {
    height: 200,
    width: 830,
    bottom: -50,
    left: -220,
    position: 'relative',
  },
});