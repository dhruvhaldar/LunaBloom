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
import { formatDate, DateFormats } from '@/utils/dateFormatter';
import { HistoryEntry } from '@/components/HistoryItem';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
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

    // Bolt Optimization: Calculate stats and format data in a single pass using reduce.
    // This avoids iterating over the array multiple times (map + reduce + map + map + map)
    // and uses cached DateFormatters to prevent expensive string formatting in loops.

    interface Accumulator {
      formattedData: any[];
      sumPeriodDuration: number;
      sumCycleLength: number;
      sumOvulationDay: number;
    }

    const { formattedData, sumPeriodDuration, sumCycleLength, sumOvulationDay } = sortedEntries.reduce<Accumulator>((acc, entry, index) => {
      const cycleLength = Number(entry.cycleLength) || 28;
      const periodDuration = Number(entry.periodDuration) || 5;

      // Calculate Stats
      acc.sumCycleLength += cycleLength;
      acc.sumPeriodDuration += periodDuration;

      const lastPeriodDate = new Date(entry.lastPeriod);

      // Calculate Ovulation Day
      let ovDay = 14;
      if (entry.predictedNextOvulation) {
        const predictedOvulationDate = new Date(entry.predictedNextOvulation);
        ovDay = Math.floor((predictedOvulationDate.getTime() - lastPeriodDate.getTime()) / (1000 * 60 * 60 * 24));
      }
      acc.sumOvulationDay += ovDay;

      // Format Data for Chart
      const lastPeriodStr = formatDate(lastPeriodDate, DateFormats.MonthDay);
      let predictedNextPeriodStr = 'N/A';
      if (entry.predictedNextPeriod) {
         predictedNextPeriodStr = formatDate(entry.predictedNextPeriod, DateFormats.MonthDay);
      }

      acc.formattedData.push({
        y: cycleLength,
        dateRange: `${lastPeriodStr} - ${predictedNextPeriodStr}`,
        labelDate: lastPeriodStr, // Optimization: Pre-calculate label to avoid string splitting in render
        date: lastPeriodDate,
        ovulationDay: ovDay,
        x: sortedEntries.length - index // Calculate x directly: oldest (1) to newest (length)
      });

      return acc;
    }, { formattedData: [], sumPeriodDuration: 0, sumCycleLength: 0, sumOvulationDay: 0 });

    const count = sortedEntries.length;
    const avgPeriodDuration = sumPeriodDuration / count;
    const avgCycleLength = sumCycleLength / count;
    const avgOvulationDay = sumOvulationDay / count;

    // Predictions using the most recent entry (which is sortedEntries[0])
    const lastEntry = sortedEntries[0];
    const calculatedAvgCycleLength = Math.round(avgCycleLength);
    const calculatedAvgOvulationDay = Math.round(avgOvulationDay);

    // Predict Period
    let periodPrediction = 'N/A';
    if (lastEntry.predictedNextPeriod) {
      periodPrediction = formatDate(lastEntry.predictedNextPeriod, DateFormats.ShortDate);
    } else {
      const lastPeriodDate = new Date(lastEntry.lastPeriod);
      const predictedDate = new Date(lastPeriodDate);
      const cycleLen = calculatedAvgCycleLength > 0 ? calculatedAvgCycleLength : (Number(lastEntry.cycleLength) || 28);
      predictedDate.setDate(lastPeriodDate.getDate() + cycleLen);
      periodPrediction = formatDate(predictedDate, DateFormats.ShortDate);
    }

    // Predict Ovulation
    let ovulationPrediction = 'N/A';
    if (lastEntry.predictedNextOvulation) {
      ovulationPrediction = formatDate(lastEntry.predictedNextOvulation, DateFormats.ShortDate);
    } else {
      const lastPeriodDate = new Date(lastEntry.lastPeriod);
      const predictedDate = new Date(lastPeriodDate);
      const cycleLen = calculatedAvgCycleLength > 0 ? calculatedAvgCycleLength : (Number(lastEntry.cycleLength) || 28);
      const ovDay = calculatedAvgOvulationDay > 0 ? calculatedAvgOvulationDay : 14;
      predictedDate.setDate(lastPeriodDate.getDate() + cycleLen - ovDay);
      ovulationPrediction = formatDate(predictedDate, DateFormats.ShortDate);
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
                text={({ datum }) => `${datum.labelDate} (${datum.y} days)`}
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
            <View
              style={styles.metricItem}
              accessible={true}
              accessibilityLabel={`Average Cycle Length: ${isNaN(averageCycleLength) ? 'N/A' : `${averageCycleLength} days`}`}
            >
              <ThemedText>Avg. Cycle Length</ThemedText>
              <ThemedText type="subtitle">
                {isNaN(averageCycleLength) ? 'N/A' : `${averageCycleLength} days`}
              </ThemedText>
            </View>

            <View
              style={styles.metricItem}
              accessible={true}
              accessibilityLabel={`Average Period Duration: ${isNaN(averagePeriodDuration) ? 'N/A' : `${averagePeriodDuration} days`}`}
            >
              <ThemedText>Avg. Period Duration</ThemedText>
              <ThemedText type="subtitle">
                {isNaN(averagePeriodDuration) ? 'N/A' : `${averagePeriodDuration} days`}
              </ThemedText>
            </View>

            <View
              style={styles.metricItem}
              accessible={true}
              accessibilityLabel={`Average Ovulation Day: ${isNaN(averageOvulationDay) ? 'N/A' : `Day ${averageOvulationDay}`}`}
            >
              <ThemedText>Avg. Ovulation Day</ThemedText>
              <ThemedText type="subtitle">
                {isNaN(averageOvulationDay) ? 'N/A' : `Day ${averageOvulationDay}`}
              </ThemedText>
            </View>

            <View
              style={styles.metricItem}
              accessible={true}
              accessibilityLabel={`Next Period Prediction: ${nextPeriodPrediction}`}
            >
              <ThemedText>Next Period Prediction</ThemedText>
              <ThemedText type="subtitle">{nextPeriodPrediction}</ThemedText>
            </View>

            <View
              style={styles.metricItem}
              accessible={true}
              accessibilityLabel={`Next Ovulation Prediction: ${nextOvulationPrediction}`}
            >
              <ThemedText>Next Ovulation Prediction</ThemedText>
              <ThemedText type="subtitle">{nextOvulationPrediction}</ThemedText>
            </View>

            <View
              style={styles.metricItem}
              accessible={true}
              accessibilityLabel={`Periods Tracked: ${entries.length}`}
            >
              <ThemedText>Periods Tracked</ThemedText>
              <ThemedText type="subtitle">
                {entries.length}
              </ThemedText>
            </View>
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
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
