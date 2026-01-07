import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, Alert, useColorScheme, Platform, UIManager, Vibration, LayoutAnimation } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'react-native';
import HistoryItem, { HistoryEntry } from '@/components/HistoryItem';

export default function TabTwoScreen() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const lastFetchedEntriesRef = useRef<string | null>(null);
  
  // Color Scheme
  const colorScheme = useColorScheme();
  const Parallaxheaderlightcolor = '#A8DADC';
  const Parallaxheaderdarkcolor = '#A8DADC';
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const deleteIconColor = colorScheme === 'dark' ? '#F1FAEE' : '#E63946';


  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const fetchEntries = async () => {
    try {
      const storedEntries = await AsyncStorage.getItem('periodEntries');

      // Optimization: Avoid parsing and state update if data hasn't changed
      if (storedEntries === lastFetchedEntriesRef.current) {
        return;
      }
      lastFetchedEntriesRef.current = storedEntries;
      
      if (storedEntries !== null) {
        try {
          const parsedEntries = JSON.parse(storedEntries);
          
          if (Array.isArray(parsedEntries)) {
            // Sort by lastPeriod in descending order (most recent first)
            // Optimization: Use string comparison for ISO dates to avoid expensive Date object creation
            parsedEntries.sort((a, b) => b.lastPeriod.localeCompare(a.lastPeriod));
            setEntries(parsedEntries);
          } else {
            console.error('Fetched data is not an array');
            setEntries([]);
          }
        } catch (parseError: any) {
          console.error('Error parsing stored period entries:', parseError instanceof Error ? parseError.message : String(parseError));
          setEntries([]);
        }
      } else {
        setEntries([]);
      }
    } catch (error: any) {
      console.error('Error fetching period entries:', error instanceof Error ? error.message : String(error));
    }
  };
  
  if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const handleDelete = useCallback(async (date: string) => {
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
              // Optimization: Use functional update to ensure we have the latest state
              // Also filtering by date (unique ID) instead of index is safer
              setEntries(currentEntries => {
                const updatedEntries = currentEntries.filter(item => item.date !== date);
                // Async storage update should happen here or be triggered by state change
                // But setState is sync-ish in batching.
                // We'll update storage immediately using the computed new array
                AsyncStorage.setItem('periodEntries', JSON.stringify(updatedEntries)).catch(err =>
                  console.error('Failed to persist deletion', err)
                );
                return updatedEntries;
              });
              
              LayoutAnimation.easeInEaseOut(); // Smooth UI transition
            } catch (error: any) {
              console.error('Error deleting entry:', error instanceof Error ? error.message : String(error));
              Alert.alert('Error', 'Failed to delete the entry. Please try again.');
            }
          },
        },
      ]
    );
  }, []); // useCallback dependency array is empty because we use functional state update
 
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: Parallaxheaderlightcolor, dark: Parallaxheaderdarkcolor }}
      headerImage={
        <Image 
          source={require('@/assets/images/history2.png')} 
          style={styles.reactLogo}
          resizeMode="contain"
        />
      }
    >
      <ThemedView style={styles.container}>
        <View style={styles.entriesContainer}>
          <ThemedText type="title" style={[styles.header, { color: textColor }]}>History</ThemedText>
          
          <ThemedText
            type="subtitle"
            style={{ color: sectionHeadingtextColor , marginBottom: 10}}
          >
            Logged Entries 📝
          </ThemedText>
          
          {entries.map((item) => (
            <HistoryItem
              key={item.date}
              item={item}
              onDelete={handleDelete}
              textColor={textColor}
              deleteIconColor={deleteIconColor}
            />
          ))}
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    paddingBottom: 90, // Add enough padding to prevent overlap with the tab bar
  },
  header: {
    marginTop: -30,
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
    borderBottomWidth: 2,
    borderBottomColor: '#ccc',
  },
  entryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  deleteIconContainer: {
    padding: 10,
  },
  reactLogo: {
    height: 280,
    width: 500,
    alignSelf: 'center',
    marginBottom: -50,
    marginTop: -50,
    marginLeft: 6,
  }
});