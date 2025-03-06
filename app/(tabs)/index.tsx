import { useState, useEffect } from 'react';
import { StyleSheet, Platform, TouchableOpacity, TextInput, ScrollView } from 'react-native';
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
  const [date, setDate] = useState(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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

  const logPeriod = () => {
    // Add your logging logic here
    setSelectedSymptoms([]);
    setNotes('');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
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
        onConfirm={(date) => {
          setDatePickerOpen(false)
          setDatePickerOpen(date)
        }}
        onCancel={() => {
          setDatePickerOpen(false)
        }}
      />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText>Cycle Length (days):</ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={cycleLength}
              onChangeText={setCycleLength}
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
                  )
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