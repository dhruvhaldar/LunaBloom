import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, ScrollView, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function TabTwoScreen() {
  const [entries, setEntries] = useState([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const storedEntries = await AsyncStorage.getItem('periodEntries');
        const parsedEntries = storedEntries ? JSON.parse(storedEntries) : [];
        
        // Sort entries by date
        parsedEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setEntries(parsedEntries);
      } catch (error) {
        console.error('Error fetching period entries:', error);
      }
    };

    fetchEntries();
  }, []);

  const textColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';
  const sectionHeaderBackgroundColor = colorScheme === 'dark' ? '#444444' : '#f0f0f0';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={{ color: textColor }}>Explore</ThemedText>
          </ThemedView>
          <ThemedText style={{ color: textColor }}>This app includes example code to help you get started.</ThemedText>
          {/* Add more collapsible sections as needed */}
        </View>

        {/* Entries */}
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
  headerContainer: {
    marginBottom: 16,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
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