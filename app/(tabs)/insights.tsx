import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView,
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
    // Calculate cycle lengths
    const cycleLengths = entriesData.map((entry, index) => {
      if (index > 0) {
        const prevEntry = entriesData[index - 1];
        const cycleLength = Math.round(
          (new Date(entry.date).getTime() - new Date(prevEntry.date).getTime()) / 
          (1000 * 3600 * 24)
        );
        return { x: index, y: cycleLength };
      }
      return null;
    }).filter(Boolean);

    // Calculate average cycle length
    const avgCycle = cycleLengths.reduce((sum, entry) => sum + entry.y, 0) / cycleLengths.length;
    setAverageCycleLength(Math.round(avgCycle));

    setCycleData(cycleLengths);
  };

  const predictNextPeriod = () => {
    if (entries.length === 0) return 'Not enough data';
    
    const lastEntry = entries[entries.length - 1];
    const lastPeriodDate = new Date(lastEntry.date);
    const predictedDate = new Date(lastPeriodDate);
    predictedDate.setDate(lastPeriodDate.getDate() + Number(lastEntry.cycleLength));

    return predictedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  return (
    <ParallaxScrollView
          headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }} headerImage={<Image 
                    source={require('@/assets/images/history2.png')} 
                    style={styles.reactLogo}
                    resizeMode="contain"
                  />}    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Cycle Insights 📊</ThemedText>

        {/* Cycle Length Trends */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor , marginBottom: 10}}>Cycle Length Trends</ThemedText>
          {cycleData.length > 0 ? (
            <VictoryChart 
              width={Dimensions.get('window').width - 50}
              height={Dimensions.get('window').width - 50}
              theme={VictoryTheme.material}
            >
              <VictoryAxis 
                label="Cycle Number" 
                style={{ 
                  axisLabel: { padding: 30 },
                  tickLabels: { fontSize: 10 } 
                }} 
              />
              <VictoryAxis 
                dependentAxis 
                label="Days" 
                style={{ 
                  axisLabel: { padding: 30 },
                  tickLabels: { fontSize: 10 } 
                }} 
              />
              <VictoryLine
                data={cycleData}
                style={
                  data: { stroke: "#EE2D60" },
                  parent: { border: "1px solid #ccc"}
                }}
              />
            </VictoryChart>
          ) : (
            <ThemedText style={styles.noDataText}>
              Not enough data to generate chart
            </ThemedText>
          )}
        </ThemedView>

        {/* Key Metrics */}
        <ThemedView style={styles.sectionContainer}>
          
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor , marginBottom: 10}} >Key Metrics</ThemedText>
          
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
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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