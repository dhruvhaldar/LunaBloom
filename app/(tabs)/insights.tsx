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
  console.log('InsightsScreen rendering...');
  const colorScheme = useColorScheme();
  const [entries, setEntries] = useState([]);
  const [cycleData, setCycleData] = useState([]);
  const [averageCycleLength, setAverageCycleLength] = useState(0);
  const [averagePeriodDuration, setAveragePeriodDuration] = useState(0);
  const [averageOvulationDay, setAverageOvulationDay] = useState(0);

  const sectionHeadingtextColor = '#ee2d60';
  const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
  const barColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const fetchEntries = async () => {
    console.log('Fetching entries...');
    try {
      const storedEntries = await AsyncStorage.getItem('periodEntries');
      if (storedEntries) {
        const parsedEntries = JSON.parse(storedEntries);
        console.log('Parsed entries:', parsedEntries);
        setEntries(parsedEntries);
        analyzeCycleData(parsedEntries);
      } else {
        console.log('No stored entries found');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const analyzeCycleData = (entriesData) => {
    if (entriesData.length < 2) {
      setAverageCycleLength(0);
      setAveragePeriodDuration(0);
      setAverageOvulationDay(0);
      setCycleData([]);
      return;
    }
  
    // Calculate averages based on the original entry order
    const periodDurations = entriesData.map((entry) => Number(entry.periodDuration) || 5);
    const avgPeriodDuration = periodDurations.reduce((sum, duration) => sum + duration, 0) / periodDurations.length;
    setAveragePeriodDuration(Math.round(avgPeriodDuration));
  
    const cycleLengths = entriesData.map((entry) => Number(entry.cycleLength) || 28);
    const avgCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
    setAverageCycleLength(Math.round(avgCycleLength));
  
    // Prepare formatted data for display
    let formattedData = entriesData.map((entry, index) => ({
      x: index + 1,
      y: Number(entry.cycleLength) || 28,
      dateRange: `${new Date(entry.lastPeriod).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${entry.predictedNextPeriod ? new Date(entry.predictedNextPeriod).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}`,
      date: new Date(entry.lastPeriod),
      ovulationDay: entry.predictedNextOvulation 
        ? Math.floor((new Date(entry.predictedNextOvulation).getTime() - new Date(entry.lastPeriod).getTime()) / (1000 * 60 * 60 * 24)) 
        : 14
    }));
  
    // Sort formatted data for display purposes (most recent last period at the top)
    formattedData = formattedData
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((item, sortedIndex) => ({ ...item, x: formattedData.length - sortedIndex }));
  
    setCycleData(formattedData);
  
    // Calculate average ovulation day based on original entry order
    const ovulationDays = entriesData.map((entry) => 
      entry.predictedNextOvulation 
        ? Math.floor((new Date(entry.predictedNextOvulation).getTime() - new Date(entry.lastPeriod).getTime()) / (1000 * 60 * 60 * 24)) 
        : 14
    );
    const avgOvulationDay = ovulationDays.reduce((sum, day) => sum + day, 0) / ovulationDays.length;
    setAverageOvulationDay(Math.round(avgOvulationDay));
  };
  

  const predictNextPeriod = () => {
    if (entries.length === 0) return 'N/A';
    
    const lastEntry = entries[0]; // Use the most recent entry
    
    // Use the stored predicted next period if available
    if (lastEntry.predictedNextPeriod) {
      const predictedDate = new Date(lastEntry.predictedNextPeriod);
      return predictedDate.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
    
    // Fallback calculation if no predicted period is stored
    const lastPeriodDate = new Date(lastEntry.lastPeriod);
    const predictedDate = new Date(lastPeriodDate);
    
    // Use average cycle length for prediction if available
    const cycleLength = averageCycleLength > 0 
      ? averageCycleLength 
      : (Number(lastEntry.cycleLength) || 28); // Fallback to 28 if no data
    
    predictedDate.setDate(lastPeriodDate.getDate() + cycleLength);
  
    return predictedDate.toLocaleDateString('en-GB', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  const predictNextOvulation = () => {
    if (entries.length === 0) return 'N/A';
    
    const lastEntry = entries[0]; // Use the most recent entry
    
    // Use the stored predicted next ovulation if available
    if (lastEntry.predictedNextOvulation) {
      const predictedDate = new Date(lastEntry.predictedNextOvulation);
      return predictedDate.toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      });
    }
    
    // Fallback calculation if no predicted ovulation is stored
    const lastPeriodDate = new Date(lastEntry.lastPeriod);
    const predictedDate = new Date(lastPeriodDate);
    
    // Use average cycle length and average ovulation day for prediction if available
    const cycleLength = averageCycleLength > 0 ? averageCycleLength : (Number(lastEntry.cycleLength) || 28);
    const ovulationDay = averageOvulationDay > 0 ? averageOvulationDay : 14;
    
    predictedDate.setDate(lastPeriodDate.getDate() + cycleLength - ovulationDay);
  
    return predictedDate.toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
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
                style={[{ fontSize: 13, fill: textColor }]}
                text={({ datum }) => `${datum.dateRange.split(' - ')[0]} (${datum.y} days)`}
              />
            }
            style={{ data: { fill: barColor }, labels: { fill: "white" }}}
            width={screenWidth - 150} // Width of bar - 150 pixels
            padding={{ top: 20, left: 5, right: 110, bottom: 20 }}
          />
          ) : ( <ThemedText style={styles.noDataText}>Not enough data</ThemedText>)}
        </ThemedView>

        
        
        {/* Key Metrics Section */}
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
              <ThemedText type="subtitle">{predictNextPeriod()}</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText>Next Ovulation Prediction</ThemedText>
              <ThemedText type="subtitle">{predictNextOvulation()}</ThemedText>
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