import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Button, useColorScheme, Platform, UIManager, Vibration, LayoutAnimation } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useFocusEffect } from '@react-navigation/native';

export default function TabTwoScreen() {
  const [entries, setEntries] = useState([]);
  const colorScheme = useColorScheme();

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const fetchEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('periodEntries');
      
      if (storedEntries !== null) {
        try {
          const parsedEntries = JSON.parse(storedEntries);
          
          if (Array.isArray(parsedEntries)) {
            parsedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
            setEntries(parsedEntries);
          } else {
            console.error('Fetched data is not an array');
            setEntries([]);
          }
        } catch (parseError) {
          console.error('Error parsing stored period entries:', parseError);
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('Error fetching period entries:', error);
    }
  };
  

  // Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const deleteEntry = async (index: number) => {
  Alert.alert(
    '🗑️ Confirm Deletion',
    'Are you sure you want to delete this entry? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: '🗑️ Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            Vibration.vibrate(50); // Haptic feedback
            const updatedEntries = entries.filter((_, i) => i !== index);

            await AsyncStorage.setItem('periodEntries', JSON.stringify(updatedEntries));
            
            LayoutAnimation.easeInEaseOut(); // Smooth UI transition
            setEntries(updatedEntries);
          } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'Failed to delete the entry. Please try again.');
          }
        },
      },
    ]
  );
};
  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const sectionHeaderBackgroundColor = colorScheme === 'dark' ? '#444444' : '#f0f0f0';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.entriesContainer}>
          <ThemedText
            type="subtitle"
            style={[styles.sectionHeader, { color: textColor, backgroundColor: sectionHeaderBackgroundColor }]}
          >
            Logged Period Entries
          </ThemedText>
          {entries.map((item, index) => (
            <View key={index} style={styles.entry}>
              <Text style={{ color: textColor }}>Date: {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={{ color: textColor }}>Last Period: {new Date(item.lastPeriod).toLocaleDateString()}</Text>
              <Text style={{ color: textColor }}>Cycle Length: {item.cycleLength} days</Text>
              <Text style={{ color: textColor }}>Symptoms: {item.selectedSymptoms.join(', ')}</Text>
              <Text style={{ color: textColor }}>Notes: {item.notes}</Text>
              <Button title="Delete" color="red" onPress={() => deleteEntry(index)} />
            </View>
          ))}
        </View>
      </ScrollView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
  sectionHeader: {
    padding: 16,
  },
  entriesContainer: {
    marginTop: 16,
  },
  entry: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
