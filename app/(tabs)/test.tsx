import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  useColorScheme, 
  View, 
  ScrollView 
} from 'react-native';
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
  const [predictedOvulations, setPredictedOvulations] = useState<Date[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Date Picker States
  const [date, setDate] = useState(new Date());
  const [, setMode] = useState('date');
  const [show, setShow] = useState(false);

  // Color Scheme
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  const sectionHeadingtextColor = '#ee2d60';
  const symptomtextColor = colorScheme === 'dark' ? '#f0f0f0' : '#ee2d60';
  const predictedsectionHeadingtextColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  const selectedSymptomBackgroundColor = '#413c58';
  const symptomButtonBorderColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

  // Date Picker Functions
  const onChange = (event: any, selectedDate: any) => {
    if (selectedDate) {
      setShow(false);
      setDate(selectedDate);
      setLastPeriod(selectedDate);
    }
  };  

  const showDatepicker = () => {
    setShow(true);
    setMode('date');
  };

  // Input Validation Functions
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
    const predictionStart = new Date(lastPeriod);
    
    for (let i = 0; i < 3; i++) {
      // Calculate next period start
      const nextPeriodDate = new Date(predictionStart);
      nextPeriodDate.setDate(predictionStart.getDate() + Number(cycleLength));
      predictions.push(nextPeriodDate);

      // Calculate ovulation
      const ovulationDate = new Date(nextPeriodDate);
      ovulationDate.setDate(ovulationDate.getDate() - 14);

      // Adjust ovulation based on period duration
      const periodDurationNum = Number(periodDuration);
      const ovulationAdjustment = Math.floor(periodDurationNum / 2);
      ovulationDate.setDate(ovulationDate.getDate() + ovulationAdjustment);

      ovulations.push(ovulationDate);

      // Prepare for next iteration
      predictionStart.setDate(predictionStart.getDate() + Number(cycleLength));
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
        console.error('Error parsing period entries:', parseError);
        entries = [];
      }
      handleCycleLengthChangeetItem('periodEntries', JSON.stringify(entries));
        setSelectedSymptoms([]);
        setNotes('');
        
        Alert.alert(
          "✅ Entry Logged!",
          "Your period start has been successfully recorded. 🩸💖",
          [{ text: "Great! 🎉" }]
        );
      } catch (saveError) {
        console.error('Error saving period entry:', saveError);
        Alert.alert(
          "⚠️ Save Failed",
          "We couldn't save your entry. Please try again. 🔄",
          [{ text: "Okay, I'll retry 🔁" }]
        );
      }
    } catch (error) {
      console.error('Unexpected error in logPeriod:', error);
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
                  month: 'long', 
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
            Log Period Start
          </ThemedText>
        </TouchableOpacity>

        {/* Predicted Periods */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: predictedsectionHeadingtextColor, marginBottom: 10 }}>
            Predicted Periods
          </ThemedText>
          {predictedPeriods.map((date, index) => (
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
                  month: 'long' 
                })}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Predicted Ovulations */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: predictedsectionHeadingtextColor, marginBottom: 10 }}>
            Predicted Ovulations
          </ThemedText>
          {predictedOvulations.map((date, index) => (
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
                  month: 'long' 
                })}
              </ThemedText>
              <ThemedText style={{ 
                color: textColor, 
                fontSize: 12, 
                marginTop: 5 
              }}>
                Fertile Window: {new Date(date.getTime() - (5 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long' 
                })} - {date.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        <View style={styles.tabBarSpacer} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

// Styles remain the same as in your previous implementation
const styles = StyleSheet.create({
  // ... (keep your existing styles)
});