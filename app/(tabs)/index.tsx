import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Alert, useColorScheme, View, ActivityIndicator, Keyboard, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { sanitizeInput, containsSuspiciousPatterns, parseSafePeriodEntries } from '@/utils/validation';
import { formatDate, DateFormats } from '@/utils/dateFormatter';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Image } from 'react-native';
import PredictionSummary from '@/components/PredictionSummary';
import { StepperInput } from '@/components/StepperInput';
import SelectionButton from '@/components/SelectionButton';
import { NotesInput, NotesInputHandle } from '@/components/NotesInput';
import { PeriodStorage } from '@/utils/storage';


export default function HomeScreen() {
  // State Management
  const [lastPeriod, setLastPeriod] = useState(() => new Date());
  const [cycleLength, setCycleLength] = useState('28');
  const [cycleWarning, setCycleWarning] = useState<string | null>(null);
  const [periodDuration, setPeriodDuration] = useState('5');
  const [periodWarning, setPeriodWarning] = useState<string | null>(null);
  // Predictions are now derived via useMemo
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [lutealPhaseEnabled, setLutealPhaseEnabled] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Ref to track notes for stable callbacks
  const notesInputRef = useRef<NotesInputHandle>(null);

  // Date Picker States
  const [date, setDate] = useState(() => new Date());
  const [, setMode] = useState('date');
  const [show, setShow] = useState(false);

  // Optimization: Memoize formatted date to prevent expensive re-calculation on every render (e.g. typing)
  const formattedLastPeriod = useMemo(() => {
    // ⚡ Bolt: Use optimized formatter to leverage caching
    return formatDate(lastPeriod, DateFormats.ShortDate);
  }, [lastPeriod]);

  // Color Scheme
  // https://coolors.co/palette/e63946-f1faee-a8dadc-457b9d-1d3557
  const colorScheme = useColorScheme();
  const Parallaxheaderlightcolor = '#A8DADC';
  const Parallaxheaderdarkcolor = '#A8DADC';

  // Optimization: Memoize header props to prevent re-rendering ParallaxScrollView header on every state change
  const headerBackgroundColor = useMemo(() => ({
    light: Parallaxheaderlightcolor,
    dark: Parallaxheaderdarkcolor
  }), [Parallaxheaderlightcolor, Parallaxheaderdarkcolor]);

  const headerImage = useMemo(() => (
    <Image
      source={require('@/assets/images/LunaBloom_adaptive.png')}
      style={styles.reactLogo}
      resizeMode="contain"
    />
  ), []);

  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';
  const symptomtextColor = colorScheme === 'dark' ? '#F1FAEE' : '#E63946';  
  const predictedsectionHeadingtextColor = colorScheme === 'dark' ? '#F1FAEE' : '#413c58';
  const selectedSymptomBackgroundColor = colorScheme === 'dark' ? '#E63946' : '#A8DADC';
  const symptomButtonBorderColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';

  // Selection Button Colors
  const selectionButtonColors = useMemo(() => ({
    borderColor: symptomButtonBorderColor,
    selectedBackgroundColor: selectedSymptomBackgroundColor,
    textColor: symptomtextColor,
  }), [symptomButtonBorderColor, selectedSymptomBackgroundColor, symptomtextColor]);

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

  const handleCycleLengthChange = useCallback((text: string) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    let number = parseInt(filteredText, 10);

    if (number > 120) number = 120;
    if (isNaN(number)) {
      setCycleLength('');
      return;
    }

    setCycleLength(number.toString());
  }, []);

  const validateCycleLength = useCallback(() => {
    const number = parseInt(cycleLength, 10);
    if (isNaN(number)) {
      setCycleWarning(null);
      return;
    }

    if (number < 21) {
      setCycleWarning("Cycle < 21 days may imply hormonal issues 🩺");
    } else if (number > 35) {
      setCycleWarning("Cycle > 35 days might be linked to PCOS 🏥");
    } else {
      setCycleWarning(null);
    }
  }, [cycleLength]);

  const handlePeriodDurationChange = useCallback((text: string) => {
    const filteredText = text.replace(/[^0-9]/g, '');
    let number = parseInt(filteredText, 10);

    if (number > 14) number = 14;
    if (isNaN(number)) {
      setPeriodDuration('');
      return;
    }
    setPeriodDuration(number.toString());
  }, []);

  const validatePeriodDuration = useCallback(() => {
    const number = parseInt(periodDuration, 10);
    if (isNaN(number)) {
      setPeriodWarning(null);
      return;
    }

    if (number > 7) {
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
    const cycleLengthNum = Number(cycleLength);

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
    const currentNotes = notesInputRef.current?.getNotes() || '';

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
        // Bolt Optimization: Use cached parsed entries directly from storage
        // This reuses the in-memory cache and avoids redundant JSON parsing/validation
        const existingEntries = await PeriodStorage.getParsedEntries();
        // Create a shallow copy to safely mutate
        entries = [...existingEntries];
      } catch (parseError: any) {
        console.error('🚨 Error retrieving period entries:', parseError instanceof Error ? parseError.message : String(parseError));
        entries = [];
      }
  
      entries.push(entry);
  
      try {
        // Bolt Optimization: Use cached PeriodStorage for saving
        await PeriodStorage.saveEntries(JSON.stringify(entries));

        setSelectedFlow(null); // Reset new field
        setSelectedSymptoms([]);
        notesInputRef.current?.resetNotes();
        
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
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
  }, [lastPeriod, cycleLength, periodDuration, selectedFlow, selectedSymptoms, predictedPeriods, predictedOvulations]);

  // Handlers for selection to ensure stable references
  const handleToggleFlow = useCallback((flow: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedFlow((prev) => (prev === flow ? null : flow));
  }, []);

  const handleToggleSymptom = useCallback((symptom: string) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  }, []);

  // Optimized: Memoize flow section to prevent re-renders when notes/date change
  const flowSection = useMemo(() => (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
        Period Flow 🩸
      </ThemedText>
      <ThemedView style={styles.symptomsGrid}>
        {flowTypes.map((flow) => (
          <SelectionButton
            key={flow}
            label={flow}
            isSelected={selectedFlow === flow}
            onToggle={handleToggleFlow}
            type="radio"
            colors={selectionButtonColors}
            accessibilityLabel={`Select ${flow} flow`}
          />
        ))}
      </ThemedView>
    </ThemedView>
  ), [selectedFlow, sectionHeadingtextColor, selectionButtonColors, handleToggleFlow]);

  // Optimized: Memoize symptoms section
  const symptomsSection = useMemo(() => (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
        Today's Symptoms 😟
      </ThemedText>
      <ThemedView style={styles.symptomsGrid}>
        {symptomsList.map((symptom) => (
          <SelectionButton
            key={symptom}
            label={symptom}
            isSelected={selectedSymptoms.includes(symptom)}
            onToggle={handleToggleSymptom}
            type="checkbox"
            colors={selectionButtonColors}
            accessibilityLabel={`Select ${symptom} symptom`}
          />
        ))}
      </ThemedView>
    </ThemedView>
  ), [selectedSymptoms, sectionHeadingtextColor, selectionButtonColors, handleToggleSymptom]);

  // Optimized: Memoize Cycle Settings section to prevent re-renders when typing notes
  const cycleSettingsSection = useMemo(() => (
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
            onChangeText={handleCycleLengthChange}
            onBlur={validateCycleLength}
            min={15}
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
            onChangeText={handlePeriodDurationChange}
            onBlur={validatePeriodDuration}
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
  ), [
    sectionHeadingtextColor,
    textColor,
    formattedLastPeriod,
    showDatepicker,
    show,
    date,
    onChange,
    cycleLength,
    handleCycleLengthChange,
    validateCycleLength,
    cycleWarning,
    periodDuration,
    handlePeriodDurationChange,
    validatePeriodDuration,
    periodWarning
  ]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={headerBackgroundColor}
      headerImage={headerImage}
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={[styles.header, { color: textColor }]}>
          Period Tracker
        </ThemedText>

        {/* Cycle Configuration */}
        {cycleSettingsSection}

        {/* Period Flow Section */}
        {flowSection}

        {/* Symptom Tracker */}
        {symptomsSection}

        {/* Notes (Optimized: Isolated component) */}
        <NotesInput
          ref={notesInputRef}
          textColor={textColor}
          borderColor={textColor}
          placeholderTextColor={colorScheme === 'dark' ? '#AAAAAA' : '#888'}
          headingColor={sectionHeadingtextColor}
        />

        {/* Log Period Button */}
        {useMemo(() => (
          <TouchableOpacity
            style={[
              styles.logButton,
              isLogging && styles.logButtonDisabled,
              showSuccess && { backgroundColor: '#198754' }
            ]}
            onPress={logPeriod}
            disabled={isLogging || showSuccess}
            accessibilityLabel={showSuccess ? "Entry successfully logged" : "Log Period Entry"}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLogging || showSuccess, busy: isLogging }}
          >
            {isLogging ? (
              <ActivityIndicator color="#ffffff" />
            ) : showSuccess ? (
              <ThemedText style={styles.logButtonText} accessibilityLiveRegion="polite">
                Entry Logged! 🎉
              </ThemedText>
            ) : (
              <ThemedText style={styles.logButtonText}>
                Log Period Entry 📖
              </ThemedText>
            )}
          </TouchableOpacity>
        ), [isLogging, showSuccess, logPeriod])}

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
