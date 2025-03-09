import React, { useState, useCallback } from 'react';
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
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryTheme, 
  VictoryAxis 
} from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const [entries, setEntries] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [averageCycleLength, setAverageCycleLength] = useState(0);
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#ee2d60' : '#ee2d60';
  const axisColor = colorScheme === 'dark' ? '#f0f0f0' : '#000000';
  const strokeColor = colorScheme === 'dark' ? '#ee2d60' : '#413c58';

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const fetchEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('periodEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        setEntries(parsedEntries);
        analyzeCycleData(parsedEntries);
      }
    } catch (error) {
      console.error('Error fetching entries', error);
    }
  };

  const analyzeCycleData = (entriesData) => {
    if (entriesData.length < 2) {
      setAverageCycleLength(0);
      setCycleData([]);
      return;
    }

    // Extract cycle lengths from each entry
    const cycleLengths = entriesData.map(entry => Number(entry.cycleLength)).filter(Boolean);

    // Calculate average cycle length
    const avgCycle = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    setAverageCycleLength(Math.round(avgCycle));

    // Prepare data for the chart
    const chartData = cycleLengths.map((length, index) => ({ x: index + 1, y: length }));
    setCycleData(chartData);
  };

  const predictNextPeriod = () => {
    if (entries.length === 0) return 'Not enough data';
    
    const lastEntry = entries[0]; // Use the most recent entry
    
    // Use the stored predicted next period if available
    if (lastEntry.predictedNextPeriod) {
      const predictedDate = new Date(lastEntry.predictedNextPeriod);
      return predictedDate.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    // Fallback calculation if no predicted period is stored
    const lastPeriodDate = new Date(lastEntry.date);
    const predictedDate = new Date(lastPeriodDate);
    
    // Use average cycle length for prediction if available
    const cycleLength = averageCycleLength > 0 
      ? averageCycleLength 
      : (Number(lastEntry.cycleLength) || 28); // Fallback to 28 if no data
    
    predictedDate.setDate(lastPeriodDate.getDate() + cycleLength);

    return predictedDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

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
        <ThemedText type="title" style={styles.title}>Cycle Insights 📊</ThemedText>

        {/* Key Metrics */}
        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Key Metrics
          </ThemedText>
          
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <ThemedText>Avg. Cycle Length</ThemedText>
              <ThemedText type="subtitle">
                {isNaN(averageCycleLength) ? 'N/A' : `${averageCycleLength} days`}
              </ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText>Next Period Prediction</ThemedText>
              <ThemedText type="subtitle">{predictNextPeriod()}</ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Cycle Length Trends */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Cycle Length Trends
          </ThemedText>
          {cycleData.length > 0 ? (
            <VictoryChart 
              width={Dimensions.get('window').width - 50}
              height={Dimensions.get('window').width - 50}
              theme={VictoryTheme.material}
            >
              <VictoryAxis 
                label="Cycle Number" 
                style={{ 
                  axisLabel: { padding: 30, 
                    fill: axisColor  },
                  tickLabels: { fontSize: 12,  fill: axisColor } 
                }} 
              />
              <VictoryAxis 
                dependentAxis 
                label="Days" 
                style={{ 
                  axisLabel: { padding: 30, 
                    fill: axisColor  },
                  tickLabels: { fontSize: 12,  fill: axisColor } 
                }} 
              />
              <VictoryLine
                data={cycleData}
                style={{
                  data: { stroke: strokeColor },
                  parent: { border: "2px solid #EE2D60"}
                }}
              />
            </VictoryChart>
          ) : (
            <ThemedText style={styles.noDataText}>
              Not enough data to generate chart
            </ThemedText>
          )}
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
  section: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 12,
  },
  sectionContainer: {
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
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
    color: '#888',
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