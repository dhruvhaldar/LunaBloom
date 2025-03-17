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
import * as FileSystem from 'expo-file-system';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';


export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
    const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';

    const settingOptions = [
        { title: 'Option A', icon: 'a', onPress: () => Alert.alert('Option A', 'Coming Soon') },
        { title: 'Option B', icon: 'b', onPress: () => Alert.alert('Option B', 'Coming Soon') },
        { title: 'Option C', icon: 'c', onPress: () => Alert.alert('Option C', 'Coming Soon') },
        { title: 'Option D', icon: 'd', onPress: () => Alert.alert('Option D', 'Coming Soon') },
      ];

      const backupData = async () => {
        try {
          const existingEntries = await AsyncStorage.getItem('periodEntries');
          if (!existingEntries) {
            Alert.alert('No data to backup', 'Please log at least one entry.');
            return;
          }
      
          const filename = FileSystem.documentDirectory + 'lunabloom_backup.json';
          await FileSystem.writeAsStringAsync(filename, existingEntries);
      
          // Share the file using React Native Share
          const result = await Share.share({
            url: filename, // Use the file URL
            title: 'LunaBloom Backup', // Optional title
            message: 'Here is your LunaBloom data backup.', // Optional message
          });
      
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // Shared with activity type of result.activityType
              Alert.alert('Backup successful!', 'Your data has been backed up and shared.');
            } else {
              // Shared
              Alert.alert('Backup successful!', 'Your data has been backed up and shared.');
            }
          } else if (result.action === Share.dismissedAction) {
            // Dismissed
            Alert.alert('Backup dismissed', 'The backup sharing was dismissed.');
          }
        } catch (error) {
          console.error('Error backing up ', error);
          Alert.alert('Backup failed', 'An error occurred while backing up your data.');
        }
      };
      

    const restoreData = async () => {
        // Implement restore logic here (e.g., using a file picker)
        Alert.alert('Restore Data', 'This feature is coming soon!');
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

                            {/* New List Options */}
                            {settingOptions.map((option, index) => (
                              <TouchableOpacity 
                                key={index} 
                                style={styles.settingOption} 
                                onPress={option.onPress}
                              >
                                <View style={styles.optionContent}>
                                  {/* <IconSymbol name={option.icon} size={20} color={textColor} /> */}
                                  <ThemedText style={{ color: textColor }}>{option.title}</ThemedText>
                                </View>
                              </TouchableOpacity>
                            ))}
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