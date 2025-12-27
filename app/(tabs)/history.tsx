import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, Alert, useColorScheme, Platform, UIManager, Vibration, LayoutAnimation, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useFocusEffect } from '@react-navigation/native';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Define the shape of a raw entry from AsyncStorage
interface Entry {
  lastPeriod: string;
  date: string;
  cycleLength: string;
  selectedSymptoms: string[];
  selectedFlow: string | null;
  notes: string;
}

export default function TabTwoScreen() {
  console.log('TabTwoScreen rendering...');
  const [entries, setEntries] = useState<Entry[]>([]);
  
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
      
      if (storedEntries !== null) {
        try {
          const parsedEntries = JSON.parse(storedEntries);
          
          if (Array.isArray(parsedEntries)) {
            // Sort by lastPeriod in descending order (most recent first)
            parsedEntries.sort((a, b) => new Date(b.lastPeriod).getTime() - new Date(a.lastPeriod).getTime());
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
            } catch (error: any) {
              console.error('Error deleting entry:', error instanceof Error ? error.message : String(error));
              Alert.alert('Error', 'Failed to delete the entry. Please try again.');
            }
          },
        },
      ]
    );
  };

  // ⚡ Bolt: Memoize entry processing to prevent repetitive Date parsing on every render
  const processedEntries = useMemo(() => {
    return entries.map((item, index) => ({
      ...item,
      // Create a stable key using date + index fallback
      key: `${item.date}-${index}`,
      formattedLastPeriod: new Date(item.lastPeriod).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year:'numeric'}),
      formattedLogDate: new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year:'numeric'}),
      symptomsDisplay: item.selectedSymptoms.join(', '),
      flowDisplay: item.selectedFlow || 'Not logged',
      originalIndex: index // Keep track of original index for deletion
    }));
  }, [entries]);
 
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
          
          {processedEntries.map((item) => (
            <View key={item.key} style={styles.entry}>
              <View style={styles.entryContent}>
                <View style={styles.entryTextContainer}>
                  <Text style={{ color: textColor }}>Last Period: {item.formattedLastPeriod}</Text>
                  <Text style={{ color: textColor }}>Cycle Length: {item.cycleLength} days</Text>
                  <Text style={{ color: textColor }}>Symptoms: {item.symptomsDisplay}</Text>
                  <Text style={{ color: textColor }}>Flow: {item.flowDisplay}</Text>
                  <Text style={{ color: textColor }}>Notes: {item.notes}</Text>
                  <Text style={{ color: textColor }}>Log Date: {item.formattedLogDate}</Text>
                </View>
                
                <TouchableOpacity style={styles.deleteIconContainer} onPress={() => deleteEntry(item.originalIndex)}>
                  <IconSymbol name="delete.fill" size={24} color={deleteIconColor} />
                </TouchableOpacity>
              </View>
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
