import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, useColorScheme, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'react-native';


export default function HomeScreen() {
  // State Management
  const [lastPeriod, setLastPeriod] = useState(new Date());
  const [cycleLength, setCycleLength] = useState('28');
  const [periodDuration, setPeriodDuration] = useState('5');
  const [predictedPeriods, setPredictedPeriods] = useState<Date[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [predictedOvulations, setPredictedOvulations] = useState<Date[]>([]);

  // Date Picker States
  const [date, setDate] = useState(new Date());
  const [, setMode] = useState('date');
  const [show, setShow] = useState(false);

  // Color Scheme
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#ee2d60' : '#ee2d60';
  const symptomtextColor = colorScheme === 'dark' ? '#f0f0f0' : '#ee2d60';  
  const predictedsectionHeadingtextColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  const selectedSymptomBackgroundColor = colorScheme === 'dark' ? '#413c58' : '#413c58';
  const symptomButtonBorderColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  
  // Date Picker Functions
  const onChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setShow(false);
      setDate(selectedDate);
      setLastPeriod(selectedDate);
    }
  };  

  const showMode = (currentMode: React.SetStateAction<string>) => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const handleCycleLengthChange = (text: string) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    let number = parseInt(filteredText, 10);

    if (number > 120) number = 120;
    if (isNaN(number)) {
      setCycleLength('');
      return;
    }

    if (number < 21) {
      Alert.alert(
        "⚠️ Short Cycle Length",
        "Your cycle length is less than 21 days. This may indicate hormonal imbalances. 💡 Consider consulting a doctor. 🩺",
        [{ text: "Got it! ✅" }]
      );
    }
    
    if (number > 35) {
      Alert.alert(
        "⚠️ Long Cycle Length",
        "Your cycle length is over 35 days. This could be linked to conditions like PCOS. 🏥 Consider medical advice. 💙",
        [{ text: "Understood! 👍" }]
      );
    }    

    setCycleLength(number.toString());
  };

  // Input Validation Functions
  const handlePeriodDurationChange = (text: string) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    let number = parseInt(filteredText, 10);

    if (number > 14) number = 14;
    if (isNaN(number)) {
      setPeriodDuration('');
      return;
    }

    if (number > 7) {
      Alert.alert(
        "⚠️ Long Period Duration",
        "Your period duration is longer than 7 days. This could indicate hormonal imbalances. 🩺 Consider consulting a doctor. 💡",
        [{ text: "Got it! ✅" }]
      );
    }

    setPeriodDuration(number.toString());
  };

  // Prediction Calculation
  const calculatePredictions = () => {
    const predictions = [];
    const ovulations = [];
    const baseDate = new Date(lastPeriod);
    const cycleLengthNum = Number(cycleLength);
    // Calculate the ovulation offset once (subtracting 1 to correct the off-by-one error)
    const ovulationOffset = cycleLengthNum <= 28 
      ? Math.floor(cycleLengthNum * 0.5) - 1 
      : Math.floor(cycleLengthNum * 0.55) - 1;
  
    for (let i = 1; i <= 3; i++) {
      // Predicted period for cycle i (e.g., for i=1, next period = baseDate + cycleLength)
      const periodDate = new Date(baseDate);
      periodDate.setDate(baseDate.getDate() + cycleLengthNum * i);
      predictions.push(periodDate);
  
      // Predicted ovulation for cycle i: use the previous period’s start as the base
      // For the first cycle (i=1), ovulation = baseDate + ovulationOffset
      // For subsequent cycles, add one full cycle length for each additional cycle.
      const ovulationDate = new Date(baseDate);
      ovulationDate.setDate(baseDate.getDate() + cycleLengthNum * (i - 1) + ovulationOffset);
      ovulations.push(ovulationDate);
    }
  
    setPredictedPeriods(predictions);
    setPredictedOvulations(ovulations);
  };
  

  // Symptoms List
  const symptomsList = [
    'Cramps', 'Bloating', 'Headache', 
    'Fatigue', 'Mood Swings', 'Tender Breasts'
  ];

  // Effect for Predictions
  useEffect(() => {
    calculatePredictions();
  }, [lastPeriod, cycleLength, periodDuration]);

  // Save Period Data
  const logPeriod = async () => {
    try {
      const entry = {
        date: new Date().toISOString(),
        lastPeriod,
        cycleLength,
        periodDuration,
        selectedSymptoms,
        notes,
        predictedNextPeriod: predictedPeriods[0]?.toISOString() || null,
        predictedNextOvulation: predictedOvulations[0]?.toISOString() || null,
      };
  
      let entries = [];
      
      try {
        const existingEntries = await AsyncStorage.getItem('periodEntries');
        entries = existingEntries ? JSON.parse(existingEntries) : [];
      } catch (parseError) {
        console.error('🚨 Error parsing period entries:', parseError);
        entries = [];
      }
  
      entries.push(entry);
  
      try {
        await AsyncStorage.setItem('periodEntries', JSON.stringify(entries));
        setSelectedSymptoms([]);
        setNotes('');
        
        Alert.alert(
          "✅ Entry Logged!",
          "Your period start has been successfully recorded. 🩸💖",
          [{ text: "Great! 🎉" }]
        );
      } catch (saveError) {
        console.error('❌ Error saving period entry:', saveError);
        Alert.alert(
          "⚠️ Save Failed",
          "We couldn't save your entry. Please try again. 🔄",
          [{ text: "Okay, I'll retry 🔁" }]
        );
      }
    } catch (error) {
      console.error('🚨 Unexpected error in logPeriod:', error);
      Alert.alert(
        "❌ Oops! Something went wrong",
        "An unexpected error occurred. Please try again later. 🛠️",
        [{ text: "Got it! 🆗" }]
      );
    }
  };
     

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }}
      headerImage={
        <Image 
          source={require('@/assets/images/LunaBloom_adaptive.png')} 
          style={styles.reactLogo}
          resizeMode="contain"
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={[styles.header, { color: textColor }]}>
          Period Tracker
        </ThemedText>

        {/* Cycle Configuration */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Cycle Settings
          </ThemedText>
          
          {/* Last Period Date */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={{ color: textColor }}>Last Period Start:</ThemedText>
            <TouchableOpacity 
              onPress={showDatepicker}
              style={[styles.dateButton, { borderColor: textColor }]}
            >
              <ThemedText style={[styles.dateText, { color: textColor }]}>
                {lastPeriod.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric'
                })}
              </ThemedText>
            </TouchableOpacity>
            {show && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                is24Hour={true}
                display="default"
                onChange={onChange}
              />
            )}
          </ThemedView>

          {/* Cycle Length */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={{ color: textColor }}>Cycle Length (days):</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: textColor }]}
              keyboardType="numeric"
              value={cycleLength}
              onChangeText={handleCycleLengthChange}
            />
          </ThemedView>

          {/* Period Duration */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={{ color: textColor }}>Period Duration (days):</ThemedText>
            <TextInput
              style={[styles.input, { color: textColor, borderColor: textColor }]}
              keyboardType="numeric"
              value={periodDuration}
              onChangeText={handlePeriodDurationChange}
            />
          </ThemedView>
        </ThemedView>

        {/* Symptom Tracker */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Today's Symptoms
          </ThemedText>
          <ThemedView style={styles.symptomsGrid}>
            {symptomsList.map((symptom) => (
              <TouchableOpacity
                key={symptom}
                style={[
                  styles.symptomButton,
                  { borderColor: symptomButtonBorderColor },
                  selectedSymptoms.includes(symptom) && { 
                    backgroundColor: selectedSymptomBackgroundColor 
                  }
                ]}
                onPress={() => {
                  setSelectedSymptoms(prev =>
                    prev.includes(symptom)
                      ? prev.filter(s => s !== symptom)
                      : [...prev, symptom]
                  );
                }}
              >
                <ThemedText style={[
                  { color: symptomtextColor },
                  selectedSymptoms.includes(symptom) && styles.selectedSymptom
                ]}>
                  {symptom}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        {/* Notes */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Notes
          </ThemedText>
          <TextInput
            style={[styles.notesInput, { color: textColor, borderColor: textColor }]}
            multiline
            value={notes}
            onChangeText={setNotes}
            placeholder="Record any additional notes..."
            placeholderTextColor={colorScheme === 'dark' ? '#AAAAAA' : '#888'}
          />
        </ThemedView>

        {/* Log Period Button */}
        <TouchableOpacity style={styles.logButton} onPress={logPeriod}>
          <ThemedText style={styles.logButtonText}>
            Log Period Entry
          </ThemedText>
        </TouchableOpacity>

        {/* Predicted Periods */}
        {/* Predicted Periods */}
<ThemedView style={styles.section}>
  <ThemedText type="subtitle" style={{ color: predictedsectionHeadingtextColor, marginBottom: 10, marginTop: 15 }}>
    Predicted Periods
  </ThemedText>
  {predictedPeriods.map((date, index) => {
    // Calculate period start date
    const periodStartDate = new Date(date);
    
    // Calculate period end date
    const periodEndDate = new Date(date);
    periodEndDate.setDate(periodEndDate.getDate() + Number(periodDuration) - 1);

    return (
      <ThemedView 
        key={index} 
        style={[
          styles.predictionItem, 
          { borderColor: textColor, borderWidth: 1 }
        ]}
      >
        <ThemedText style={{ color: textColor }}>
          {date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </ThemedText>
        <ThemedText 
          style={{ 
            color: textColor, 
            fontSize: 12, 
            marginTop: 5 
          }}
        >
          {periodStartDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short' 
          })} - {periodEndDate.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </ThemedText>
      </ThemedView>
    );
  })}
</ThemedView>

        {/* Predicted Ovulations */}
<ThemedView style={styles.section}>
  <ThemedText 
    type="subtitle" 
    style={{ color: predictedsectionHeadingtextColor, marginBottom: 10 }}
  >
    Predicted Ovulations
  </ThemedText>
  {predictedOvulations.map((date, index) => {
    // Calculate fertile window start (5 days before ovulation)
    const fertileWindowStart = new Date(date);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 2);

    // Calculate fertile window end (day of ovulation)
    const fertileWindowEnd = new Date(date);

    return (
      <ThemedView 
        key={index} 
        style={[
          styles.predictionItem, 
          { borderColor: textColor, borderWidth: 1 }
        ]}
      >
        <ThemedText style={{ color: textColor }}>
          Ovulation: {date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </ThemedText>
        <ThemedText 
          style={{ 
            color: textColor, 
            fontSize: 12, 
            marginTop: 5 
          }}
        >
          Fertile Window: {fertileWindowStart.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short' 
          })} - {fertileWindowEnd.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short' 
          })}
        </ThemedText>
      </ThemedView>
    );
  })}
</ThemedView>

        <View style={styles.tabBarSpacer} />
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
  datePickerWrapper: {
    marginTop: 10,
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
    borderRadius: 40,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  logButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reactLogo: {
    height: 400,
    width: 760,
    alignSelf: 'center',
    marginBottom: -50,
    marginTop: -50,
  },
  tabBarSpacer: {
    height: 50, // Adjust this to match your tab bar height
    width: '100%',
  },
});
