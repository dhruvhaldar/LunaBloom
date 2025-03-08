import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Button, useColorScheme, Platform, UIManager, Vibration, LayoutAnimation } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'react-native';

export default function TabTwoScreen() {
  const [entries, setEntries] = useState([]);
  const colorScheme = useColorScheme();
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#ee2d60' : '#ee2d60';


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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#ffdde2', dark: '#151718' }}
      headerImage={
        <Image 
          source={require('@/assets/images/history.png')} 
          style={styles.reactLogo}
          resizeMode="contain"
        />
      }
    >
      <ThemedView style={styles.container}>
        <View style={styles.entriesContainer}>
          <ThemedText
            type="title"
            style={[styles.header, { color: sectionHeadingtextColor }]}
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
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  header: {
    marginTop: -16,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 12,
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
  reactLogo: {
    height: 400,
    width: 500,
    alignSelf: 'center',
    marginBottom: -50,
    marginTop: -50,
    marginLeft: -30,
  }
});
