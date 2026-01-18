import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, useColorScheme, View, ActivityIndicator, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { validateInputLength, MAX_NOTES_LENGTH, sanitizeInput, containsSuspiciousPatterns } from '@/utils/validation';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import PredictionSummary from '@/components/PredictionSummary';
import { StepperInput } from '@/components/StepperInput';


export default function HomeScreen() {
  // State Management
  const [lastPeriod, setLastPeriod] = useState(new Date());
  const [cycleLength, setCycleLength] = useState(28);
  const [cycleWarning, setCycleWarning] = useState<string | null>(null);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [periodWarning, setPeriodWarning] = useState<string | null>(null);
  // Predictions are now derived via useMemo
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [lutealPhaseEnabled, setLutealPhaseEnabled] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  // Ref to track notes for stable callbacks
  const notesRef = useRef(notes);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  // Date Picker States
  const [date, setDate] = useState(new Date());
  const [, setMode] = useState('date');
  const [show, setShow] = useState(false);

  // Optimization: Memoize formatted date to prevent expensive re-calculation on every render (e.g. typing)
  const formattedLastPeriod = useMemo(() => {
    return lastPeriod.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, [lastPeriod]);

  // Color Scheme
  // https://coolors.co/palette/e63946-f1faee-a8dadc-457b9d-1d3557
  const colorScheme = useColorScheme();
  const Parallaxheaderlightcolor = '#A8DADC';
  const Parallaxheaderdarkcolor = '#A8DADC';
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';
  const symptomtextColor = colorScheme === 'dark' ? '#F1FAEE' : '#E63946';  
  const predictedsectionHeadingtextColor = colorScheme === 'dark' ? '#F1FAEE' : '#413c58';
  const selectedSymptomBackgroundColor = colorScheme === 'dark' ? '#E63946' : '#A8DADC';
  const symptomButtonBorderColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  
  // Date Picker Functions
  const onChange = useCallback((event: any, selectedDate: any) => {
    if (selectedDate) {
      setShow(false);
      setDate(selectedDate);
      setLastPeriod(selectedDate);
    }
  }, []);

  const showMode = useCallback((currentMode: React.SetStateAction<string>) => {
    setShow(true);
    setMode(currentMode);
  }, []);

  const showDatepicker = useCallback(() => {
    showMode('date');
  }, [showMode]);

  const handleCycleLengthChange = useCallback((value: number) => {
    setCycleLength(value);
  }, []);

  useEffect(() => {
    if (cycleLength < 21) {
      setCycleWarning("Cycle < 21 days may imply hormonal issues 🩺");
    } else if (cycleLength > 35) {
      setCycleWarning("Cycle > 35 days might be linked to PCOS 🏥");
    } else {
      setCycleWarning(null);
    }
  }, [cycleLength]);

  // Input Validation Functions
  const handleNotesChange = useCallback((text: string) => {
    if (!validateInputLength(text, MAX_NOTES_LENGTH)) {
        return;
    }
    setNotes(text);
  }, []);

  const handlePeriodDurationChange = useCallback((value: number) => {
    setPeriodDuration(value);
  }, []);

  useEffect(() => {
    if (periodDuration > 7) {
      setPeriodWarning("Duration > 7 days may imply hormonal issues 🩺");
    } else {
      setPeriodWarning(null);
    }
  }, [periodDuration]);

  // Load luteal phase setting
  useEffect(() => {
    const loadLutealPhaseSetting = async () => {
      try {
        const savedSetting = await AsyncStorage.getItem('lutealPhase');
        if (savedSetting !== null) {
          setLutealPhaseEnabled(JSON.parse(savedSetting));
        }
      } catch (error: any) {
        console.error('Error loading luteal phase setting:', error instanceof Error ? error.message : String(error));
      }
    };
    loadLutealPhaseSetting();
  }, []);

  // Calculate predictions using useMemo to avoid extra renders and state synchronization
  const { predictedPeriods, predictedOvulations } = useMemo(() => {
    const predictions = [];
    const ovulations = [];
    const baseDate = new Date(lastPeriod);
    const cycleLengthNum = cycleLength;

    // Calculate ovulation based on luteal phase
    const calculateOvulationDay = (cLength: number) => {
      if (lutealPhaseEnabled) {
        // With luteal phase enabled, count backwards 14 days from the next period
        return cLength - 14;
      } else {
        // Without luteal phase, use the previous calculation method
        return cLength <= 28
          ? Math.floor(cLength * 0.5) - 1
          : Math.floor(cLength * 0.55) - 1;
      }
    };

    const ovulationOffset = calculateOvulationDay(cycleLengthNum);

    for (let i = 1; i <= 3; i++) {
      // Predicted period
      const periodDate = new Date(baseDate);
      periodDate.setDate(baseDate.getDate() + cycleLengthNum * i);
      predictions.push(periodDate);

      // Predicted ovulation
      const ovulationDate = new Date(baseDate);
      ovulationDate.setDate(baseDate.getDate() + cycleLengthNum * (i - 1) + ovulationOffset);
      ovulations.push(ovulationDate);
    }

    return { predictedPeriods: predictions, predictedOvulations: ovulations };
  }, [lastPeriod, cycleLength, lutealPhaseEnabled]);

  // Save Period Data
  // Optimization: Use ref for notes to keep callback stable during typing
  const logPeriod = useCallback(async () => {
    Keyboard.dismiss();
    const currentNotes = notesRef.current;

    // Security: Validate notes before saving to prevent Stored XSS and future backup corruption
    const sanitizedNotes = sanitizeInput(currentNotes);
    if (containsSuspiciousPatterns(sanitizedNotes)) {
      Alert.alert(
        "⚠️ Invalid Input",
        "Your notes contain characters or patterns that are not allowed for security reasons. Please remove any scripts or HTML tags.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsLogging(true);
    try {
      const entry = {
        date: new Date().toISOString(),
        lastPeriod,
        cycleLength,
        periodDuration,
        selectedFlow,
        selectedSymptoms,
        notes: sanitizedNotes,
        predictedNextPeriod: predictedPeriods[0]?.toISOString() || null,
        predictedNextOvulation: predictedOvulations[0]?.toISOString() || null,
      };
  
      let entries = [];
      
      try {
        const existingEntries = await AsyncStorage.getItem('periodEntries');
        entries = existingEntries ? JSON.parse(existingEntries) : [];
      } catch (parseError: any) {
        console.error('🚨 Error parsing period entries:', parseError instanceof Error ? parseError.message : String(parseError));
        entries = [];
      }
  
      entries.push(entry);
  
      try {
        await AsyncStorage.setItem('periodEntries', JSON.stringify(entries));
        setSelectedFlow(null); // Reset new field
        setSelectedSymptoms([]);
        setNotes('');
        
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        Alert.alert(
          "✅ Entry Logged!",
          "Your period start has been successfully recorded. 🩸💖",
          [{ text: "Great! 🎉" }]
        );
      } catch (saveError: any) {
        console.error('❌ Error saving period entry:', saveError instanceof Error ? saveError.message : String(saveError));
        Alert.alert(
          "⚠️ Save Failed",
          "We couldn't save your entry. Please try again. 🔄",
          [{ text: "Okay, I'll retry 🔁" }]
        );
      }
    } catch (error: any) {
      console.error('🚨 Unexpected error in logPeriod:', error instanceof Error ? error.message : String(error));
      Alert.alert(
        "❌ Oops! Something went wrong",
        "An unexpected error occurred. Please try again later. 🛠️",
        [{ text: "Got it! 🆗" }]
      );
    } finally {
      setIsLogging(false);
    }
  }, [lastPeriod, cycleLength, periodDuration, selectedFlow, selectedSymptoms, predictedPeriods, predictedOvulations]); // notes removed from dependencies

  // Optimized: Memoize flow section to prevent re-renders when notes/date change
  const flowSection = useMemo(() => (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
        Period Flow 🩸
      </ThemedText>
      <ThemedView style={styles.symptomsGrid}>
        {flowTypes.map((flow) => (
          <TouchableOpacity
            key={flow}
            style={[
              styles.symptomButton,
              { borderColor: symptomButtonBorderColor },
              selectedFlow === flow && { backgroundColor: selectedSymptomBackgroundColor },
            ]}
            onPress={() => {
              Haptics.selectionAsync();
              setSelectedFlow((prev) => (prev === flow ? null : flow));
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: selectedFlow === flow }}
            accessibilityLabel={`Select ${flow} flow`}
          >
            <View style={styles.symptomContent}>
              {selectedFlow === flow && (
                <IconSymbol
                  name="checkmark"
                  size={16}
                  color={symptomtextColor}
                  style={{ marginRight: 4 }}
                />
              )}
              <ThemedText
                style={[
                  { color: symptomtextColor },
                  selectedFlow === flow && styles.selectedSymptom,
                ]}
              >
                {flow}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  ), [selectedFlow, sectionHeadingtextColor, symptomButtonBorderColor, selectedSymptomBackgroundColor, symptomtextColor]);

  // Optimized: Memoize symptoms section
  const symptomsSection = useMemo(() => (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
        Today's Symptoms 😟
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
              Haptics.selectionAsync();
              setSelectedSymptoms(prev =>
                prev.includes(symptom)
                  ? prev.filter(s => s !== symptom)
                  : [...prev, symptom]
              );
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selectedSymptoms.includes(symptom) }}
            accessibilityLabel={`Select ${symptom} symptom`}
          >
            <View style={styles.symptomContent}>
              {selectedSymptoms.includes(symptom) && (
                <IconSymbol
                  name="checkmark"
                  size={16}
                  color={symptomtextColor}
                  style={{ marginRight: 4 }}
                />
              )}
              <ThemedText style={[
                { color: symptomtextColor },
                selectedSymptoms.includes(symptom) && styles.selectedSymptom
              ]}>
                {symptom}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ThemedView>
  ), [selectedSymptoms, sectionHeadingtextColor, symptomButtonBorderColor, selectedSymptomBackgroundColor, symptomtextColor]);

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: Parallaxheaderlightcolor, dark: Parallaxheaderdarkcolor }}
      headerImage={
        <Image source={require('@/assets/images/LunaBloom_adaptive.png')} style={styles.reactLogo} resizeMode="contain"/>
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={[styles.header, { color: textColor }]}>
          Period Tracker
        </ThemedText>

        {/* Cycle Configuration */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Cycle Settings ⚙️
          </ThemedText>
          
          {/* Last Period Date */}
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={{ color: textColor }}>Last Period Start</ThemedText>
            <TouchableOpacity
              onPress={showDatepicker}
              style={[styles.dateButton, { borderColor: textColor }]}
              accessibilityLabel={`Select last period start date. Current: ${formattedLastPeriod}`}
              accessibilityRole="button"
            >
              <ThemedText style={[styles.dateText, { color: textColor }]}>
                {formattedLastPeriod}
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
          <View>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={{ color: textColor }}>Cycle Length (days)</ThemedText>
              <StepperInput
                value={cycleLength}
                onChange={handleCycleLengthChange}
                min={10}
                max={120}
                label="Cycle length in days"
              />
            </ThemedView>
            {cycleWarning && (
              <ThemedText
                style={{ color: '#E63946', fontSize: 12, marginTop: -8, marginBottom: 8, textAlign: 'right' }}
                accessibilityLiveRegion="polite"
              >
                ⚠️ {cycleWarning}
              </ThemedText>
            )}
          </View>

          {/* Period Duration */}
          <View>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={{ color: textColor }}>Period Duration (days)</ThemedText>
              <StepperInput
                value={periodDuration}
                onChange={handlePeriodDurationChange}
                min={1}
                max={14}
                label="Period duration in days"
              />
            </ThemedView>
            {periodWarning && (
              <ThemedText
                style={{ color: '#E63946', fontSize: 12, marginTop: -8, marginBottom: 8, textAlign: 'right' }}
                accessibilityLiveRegion="polite"
              >
                ⚠️ {periodWarning}
              </ThemedText>
            )}
          </View>
        </ThemedView>

        {/* Period Flow Section */}
        {flowSection}

        {/* Symptom Tracker */}
        {symptomsSection}

        {/* Notes */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Notes 🗒️
          </ThemedText>
          <TextInput
            style={[styles.notesInput, { color: textColor, borderColor: textColor }]}
            multiline
            value={notes}
            onChangeText={handleNotesChange}
            placeholder="Record any additional notes..."
            placeholderTextColor={colorScheme === 'dark' ? '#AAAAAA' : '#888'}
            accessibilityLabel="Notes"
            accessibilityHint={`Maximum ${MAX_NOTES_LENGTH} characters`}
            maxLength={MAX_NOTES_LENGTH}
          />
          <ThemedText
            style={{ color: textColor, fontSize: 10, textAlign: 'right' }}
            accessibilityLabel={`${notes.length} characters used out of ${MAX_NOTES_LENGTH}`}
          >
            {notes.length}/{MAX_NOTES_LENGTH}
          </ThemedText>
        </ThemedView>

        {/* Log Period Button */}
        {useMemo(() => (
          <TouchableOpacity
            style={[styles.logButton, isLogging && styles.logButtonDisabled]}
            onPress={logPeriod}
            disabled={isLogging}
            accessibilityLabel="Log Period Entry"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLogging, busy: isLogging }}
          >
            {isLogging ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText style={styles.logButtonText}>
                Log Period Entry 📖
              </ThemedText>
            )}
          </TouchableOpacity>
        ), [isLogging, logPeriod])}

        {/* Predicted Periods */}
        <PredictionSummary
          predictedPeriods={predictedPeriods}
          predictedOvulations={predictedOvulations}
          periodDuration={periodDuration}
          textColor={textColor}
          predictedHeadingColor={predictedsectionHeadingtextColor}
        />

        <View style={styles.tabBarSpacer} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const flowTypes = ['Light', 'Normal', 'Heavy', 'Spotting'];
const symptomsList = [
  'Cramps', 'Bloating', 'Headache',
  'Fatigue', 'Mood Swings', 'Tender Breasts'
];

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  header: {
    marginTop: -10,
    marginBottom: 8,
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
  symptomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingHorizontal: 15,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  logButton: {
    backgroundColor: '#457B9D',
    borderRadius: 40,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  logButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logButtonDisabled: {
    opacity: 0.7,
  },
  reactLogo: {
    height: 290,
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
