import React, { useState, useCallback, useMemo, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Image, 
  useColorScheme, 
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { VictoryBar, VictoryLabel } from 'victory-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { EmptyState } from '@/components/ui/EmptyState';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const lastFetchedEntriesRef = useRef<string | null>(null);

  // Color Scheme
  const colorScheme = useColorScheme();
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';
  const barColor = colorScheme === 'dark' ? '#F1FAEE' : '#457B9D';

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const fetchEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('periodEntries');

      // Optimization: Only parse and update state if the data has actually changed
      if (storedEntries === lastFetchedEntriesRef.current) {
        return;
      }
      lastFetchedEntriesRef.current = storedEntries;

      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        // Note: We're just setting entries here. Sorting and derivation happen in useMemo.
        setEntries(parsedEntries);
      } else {
        setEntries([]);
      }
    } catch (error: any) {
      console.error('Error fetching entries:', error instanceof Error ? error.message : String(error));
    }
  };

  // ⚡ Bolt: Derived State Optimization
  // Instead of syncing state with useEffect/functions, we derive expensive data during render.
  // This reduces re-renders and ensures data consistency.
  const {
    cycleData,
    averageCycleLength,
    averagePeriodDuration,
    averageOvulationDay,
    nextPeriodPrediction,
    nextOvulationPrediction
  } = useMemo(() => {
    if (!entries || entries.length < 2) {
      return {
        cycleData: [],
        averageCycleLength: 0,
        averagePeriodDuration: 0,
        averageOvulationDay: 0,
        nextPeriodPrediction: 'N/A',
        nextOvulationPrediction: 'N/A'
      };
    }

    // Sort entries by date descending (newest first) for predictions and consistent processing
    // Optimization: Use string comparison for ISO dates to avoid expensive Date object creation
    const sortedEntries = [...entries].sort((a, b) => b.lastPeriod.localeCompare(a.lastPeriod));

    // Calculate averages
    const periodDurations = sortedEntries.map((entry) => Number(entry.periodDuration) || 5);
    const avgPeriodDuration = periodDurations.reduce((sum, duration) => sum + duration, 0) / periodDurations.length;

    const cycleLengths = sortedEntries.map((entry) => Number(entry.cycleLength) || 28);
    const avgCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;

    // Calculate formatted data for VictoryBar
    // VictoryBar expects x and y. x should be sequential or date.
    // Original logic: map entries, then sort descending by date (so newest first), then assign x based on index.
    // Wait, original logic:
    // 1. Map entries (unsorted in original fetch)
    // 2. Sort by date descending
    // 3. Map again to assign x: formattedData.length - sortedIndex (so x=1 is oldest, x=N is newest)

    let formattedData = sortedEntries.map((entry) => ({
      y: Number(entry.cycleLength) || 28,
      dateRange: `${new Date(entry.lastPeriod).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${entry.predictedNextPeriod ? new Date(entry.predictedNextPeriod).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}`,
      date: new Date(entry.lastPeriod),
      ovulationDay: entry.predictedNextOvulation 
        ? Math.floor((new Date(entry.predictedNextOvulation).getTime() - new Date(entry.lastPeriod).getTime()) / (1000 * 60 * 60 * 24)) 
        : 14
    }));

    // Since we already sorted sortedEntries descending, formattedData is already sorted descending.
    // Assign x so that oldest is on left (x=1) or right?
    // Original: x: formattedData.length - sortedIndex.
    // Index 0 (newest) -> x = length - 0 = length (Right side)
    // Index last (oldest) -> x = length - (length-1) = 1 (Left side)
    // So graph goes Old -> New from Left -> Right.
    formattedData = formattedData.map((item, index) => ({
      ...item,
      x: formattedData.length - index
    }));

    const ovulationDays = sortedEntries.map((entry) =>
      entry.predictedNextOvulation 
        ? Math.floor((new Date(entry.predictedNextOvulation).getTime() - new Date(entry.lastPeriod).getTime()) / (1000 * 60 * 60 * 24)) 
        : 14
    );
    const avgOvulationDay = ovulationDays.reduce((sum, day) => sum + day, 0) / ovulationDays.length;

    // Predictions using the most recent entry (which is sortedEntries[0])
    const lastEntry = sortedEntries[0];
    const calculatedAvgCycleLength = Math.round(avgCycleLength);
    const calculatedAvgOvulationDay = Math.round(avgOvulationDay);

    // Predict Period
    let periodPrediction = 'N/A';
    if (lastEntry.predictedNextPeriod) {
      periodPrediction = new Date(lastEntry.predictedNextPeriod).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } else {
      const lastPeriodDate = new Date(lastEntry.lastPeriod);
      const predictedDate = new Date(lastPeriodDate);
      const cycleLen = calculatedAvgCycleLength > 0 ? calculatedAvgCycleLength : (Number(lastEntry.cycleLength) || 28);
      predictedDate.setDate(lastPeriodDate.getDate() + cycleLen);
      periodPrediction = predictedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    // Predict Ovulation
    let ovulationPrediction = 'N/A';
    if (lastEntry.predictedNextOvulation) {
      ovulationPrediction = new Date(lastEntry.predictedNextOvulation).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } else {
      const lastPeriodDate = new Date(lastEntry.lastPeriod);
      const predictedDate = new Date(lastPeriodDate);
      const cycleLen = calculatedAvgCycleLength > 0 ? calculatedAvgCycleLength : (Number(lastEntry.cycleLength) || 28);
      const ovDay = calculatedAvgOvulationDay > 0 ? calculatedAvgOvulationDay : 14;
      predictedDate.setDate(lastPeriodDate.getDate() + cycleLen - ovDay);
      ovulationPrediction = predictedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return {
      cycleData: formattedData,
      averageCycleLength: calculatedAvgCycleLength,
      averagePeriodDuration: Math.round(avgPeriodDuration),
      averageOvulationDay: calculatedAvgOvulationDay,
      nextPeriodPrediction: periodPrediction,
      nextOvulationPrediction: ovulationPrediction
    };
  }, [entries]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }}
      headerImage={
        <Image 
          source={require('@/assets/images/history2.png')}
          style={styles.reactLogo}
          resizeMode="contain"
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={[styles.title, { color: sectionHeadingtextColor }]}>Cycle Insights</ThemedText>

        {/* Previous Cycles Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}> Previous Cycles </ThemedText>
          
          {cycleData.length > 0 ? (  
            <VictoryBar 
            data={cycleData} horizontal 
            barRatio={0.2} // Adjusted to make bars shorter
            labels={({ datum }) => `${datum.y} days`}
            labelComponent={
              <VictoryLabel 
                dy={0} 
                dx={10} 
                textAnchor="start" 
                style={[{ fontSize: 13, fill: barColor }]}
                text={({ datum }) => `${datum.dateRange.split(' - ')[0]} (${datum.y} days)`}
              />
            }
            style={{ data: { fill: barColor }, labels: { fill: barColor }}}
            width={screenWidth - 150} // Width of bar - 150 pixels
            padding={{ top: 20, left: 5, right: 110, bottom: 20 }}
          />
          ) : (
            <EmptyState
              title="No Insights Yet"
              message="Log more periods to unlock trends and insights."
              icon="bar-chart.fill"
              actionLabel="Log Now"
              onAction={() => router.push('/')}
              style={{ marginTop: 10, padding: 20 }}
            />
          )}
        </ThemedView>

        
        
        {/* Key Metrics Section */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Key Metrics 📊
          </ThemedText>
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <ThemedText>Avg. Cycle Length</ThemedText>
              <ThemedText type="subtitle">
                {isNaN(averageCycleLength) ? 'N/A' : `${averageCycleLength} days`}
              </ThemedText>
            </View>
          </View>
            <View style={styles.metricItem}>
              <ThemedText>Avg. Period Duration</ThemedText>
              <ThemedText type="subtitle">
                {isNaN(averagePeriodDuration) ? 'N/A' : `${averagePeriodDuration} days`}
              </ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText>Avg. Ovulation Duration</ThemedText>
              <ThemedText type="subtitle">
                {isNaN(averageOvulationDay) ? 'N/A' : `${averageOvulationDay} days`}
              </ThemedText>
            </View>
            
            <View style={styles.metricItem}>
              <ThemedText>Next Period Prediction</ThemedText>
              <ThemedText type="subtitle">{nextPeriodPrediction}</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText>Next Ovulation Prediction</ThemedText>
              <ThemedText type="subtitle">{nextOvulationPrediction}</ThemedText>
            </View>

            <View style={styles.metricItem}>
              <ThemedText>Periods Tracked</ThemedText>
              <ThemedText type="subtitle">
                {entries.length}
              </ThemedText>
            </View>
            
        </ThemedView>

      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 90, // Add enough padding to prevent overlap with the tab bar
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionContainer: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  noDataText: {
    textAlign: 'center',
    color: '#E63946',
    padding: 20,
  },
  reactLogo: {
    height: 380,
    width: 500,
    alignSelf: 'center',
    marginBottom: -50,
    marginTop: -50,
    marginLeft: 6,
  }
});
