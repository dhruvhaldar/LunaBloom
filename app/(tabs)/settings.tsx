import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Alert, 
  useColorScheme, 
  TouchableOpacity,
  ScrollView,
  Image,
  Share // Import Share from React Native
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';


export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
    const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';

    // const settingOptions = [
    //     { title: 'Option A', icon: 'a', onPress: () => Alert.alert('Option A', 'Coming Soon') },
    //     { title: 'Option B', icon: 'b', onPress: () => Alert.alert('Option B', 'Coming Soon') },
    //     { title: 'Option C', icon: 'c', onPress: () => Alert.alert('Option C', 'Coming Soon') },
    //     { title: 'Option D', icon: 'd', onPress: () => Alert.alert('Option D', 'Coming Soon') },
    //   ];

      const backupData = async () => {
            console.log('🔄 Starting backup process...');
            try {
              console.log('📱 Fetching entries from AsyncStorage...');
              const existingEntries = await AsyncStorage.getItem('periodEntries');
              if (!existingEntries) {
                console.log('⚠️ No entries found to backup');
                Alert.alert('No data to backup', 'Please log at least one entry.');
                return;
              }

              console.log('✅ Found existing entries, parsing JSON...');
              // Parse the entries to ensure valid JSON
              const entries = JSON.parse(existingEntries);
              console.log(`📊 Found ${entries.length} entries to backup`);
              
              // Create a backup object with metadata
              const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                entries: entries
              };

              console.log('📝 Creating backup JSON...');
              // Convert to JSON string
              const backupJson = JSON.stringify(backup, null, 2);

              console.log('📤 Opening share dialog...');
              // Share the backup data
              await Share.share({
                message: backupJson,
                title: 'Period Tracker Backup'
              });

              console.log('🎉 Backup completed successfully!');
              Alert.alert(
                '✅ Backup Successful',
                'Your period data has been backed up successfully!'
              );
            } catch (error) {
              console.error('❌ Backup failed with error:', error);
              Alert.alert(
                '❌ Backup Failed',
                'There was an error creating your backup. Please try again.'
              );
            }
      };
      

    const restoreData = async () => {
        // Implement restore logic here (e.g., using a file picker)
        Alert.alert('Restore Data', 'This feature is coming soon!');
      };


    const aboutOption = async () => {
        // Implement restore logic here (e.g., using a file picker)
        Alert.alert('About', 'Made with ❤️ in India 🇮🇳');
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
                <ThemedText type="title" style={[styles.header, { color: textColor }]}>Settings </ThemedText>
                 <ThemedText type="subtitle" style={{ color: sectionHeadingtextColor, marginBottom: 10 }}>
                            Data Management ⚙️
                          </ThemedText>
                          <ScrollView>
                            {/* Existing Backup/Restore Options */}
                            <TouchableOpacity style={styles.settingOption} onPress={backupData}>
                              <ThemedText style={{ color: textColor }}>Backup Data</ThemedText>
                            </TouchableOpacity>
                    
                            <TouchableOpacity style={styles.settingOption} onPress={restoreData}>
                              <ThemedText style={{ color: textColor }}>Restore Data</ThemedText>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.settingOption} onPress={aboutOption}>
                              <ThemedText style={{ color: textColor }}>About</ThemedText>
                            </TouchableOpacity>

                          </ScrollView>
        </ThemedView>

      </ParallaxScrollView>
);
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
        marginTop: -10,
        marginBottom: 8,
        textAlign: 'center',
      },
    reactLogo: {
      height: 380,
      width: 500,
      alignSelf: 'center',
      marginBottom: -50,
      marginTop: -50,
      marginLeft: 6,
    },
    settingOption: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc', // Or use a themed color
      width: '100%',
      flexDirection: 'row',  // Align icon and text horizontally
      alignItems: 'center',   // Center vertically
    },
    optionContent: { // Style for the content (icon and text)
      flex: 1, // Allow text to take remaining space
      marginLeft: 10, // Add some space between icon and text
    },
  });