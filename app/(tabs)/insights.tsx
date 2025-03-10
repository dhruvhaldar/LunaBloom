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
import { VictoryBar, VictoryLabel } from 'victory-native';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const colorScheme = useColorScheme();
  const [entries, setEntries] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [averageCycleLength, setAverageCycleLength] = useState(0);
  const sectionHeadingtextColor = '#ee2d60';
  const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

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

  const analyzeCycleData = (entriesData: any[]) => {
    if (entriesData.length < 2) {
      setAverageCycleLength(0);
      setCycleData([]);
      return;
    }

    const formattedData = entriesData.map((entry, index) => ({
      x: index + 1,
      y: Number(entry.cycleLength) || 28,
      dateRange: `${entry.startDate} - ${entry.endDate}`
    }));

    setCycleData(formattedData);
    const avgCycle = formattedData.reduce((sum, entry) => sum + entry.y, 0) / formattedData.length;
    setAverageCycleLength(Math.round(avgCycle));
  };

  const predictNextPeriod = () => {
    if (entries.length === 0) return 'N/A';
    
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

        <ThemedView style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
            Previous Cycles
          </ThemedText>
          {cycleData.length > 0 ? (
            
            <VictoryBar 
              data={cycleData} 
              horizontal 
              barRatio={0.4} // Adjusted to make bars shorter
              labels={({ datum }) => `${datum.y} days`}
              labelComponent={
                <VictoryLabel 
                  dy={0} 
                  textAnchor="middle"
                  style={[{ fontSize: 10, fill: textColor }]}
                />
              }
              style={{ 
                data: { fill: "#413c58" },
                labels: { fill: "white" }
              }}
              width={screenWidth - 140}
              padding={{ left: 50, right: 10, top: 10, bottom: 10 }} // Added padding to prevent overlap
            />
            
          ) : (
            <ThemedText style={styles.noDataText}>Not enough data</ThemedText>
          )}
        </ThemedView>

        
        
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

      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 90,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
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