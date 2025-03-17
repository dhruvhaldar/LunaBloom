import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, Button, useColorScheme, Platform, UIManager, Vibration, LayoutAnimation, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

// import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

    // const backupData = async () => {
    //     try {
    //       const existingEntries = await AsyncStorage.getItem('periodEntries');
    //       if (!existingEntries) {
    //         Alert.alert('No data to backup', 'Please log at least one entry.');
    //         return;
    //       }
    
    //       const filename = FileSystem.documentDirectory + 'lunabloom_backup.json';
    //       await FileSystem.writeAsStringAsync(filename, existingEntries);
    
    //       // Share the file
    //       const shared = await Sharing.shareAsync(filename);
    //       if (shared.status === 'granted') {
    //         Alert.alert('Backup successful!', 'Your data has been backed up and shared.');
    //       }
    //     } catch (error) {
    //       console.error('Error backing up ', error);
    //       Alert.alert('Backup failed', 'An error occurred while backing up your data.');
    //     }
    //   };

    const restoreData = async () => {
        // Implement restore logic here (e.g., using a file picker)
        Alert.alert('Restore Data', 'This feature is coming soon!');
      };

      return (
        <ThemedView style={styles.container}>
          <ScrollView> {/* Add ScrollView here */}
            <ThemedText style={[styles.title, { color: textColor }]}>Settings ⚙️</ThemedText>
    
            {/* <TouchableOpacity style={styles.settingOption} onPress={backupData}>
              <ThemedText style={{ color: textColor }}>Backup Data</ThemedText>
            </TouchableOpacity> */}
    
            <TouchableOpacity style={styles.settingOption} onPress={restoreData}>
              <ThemedText style={{ color: textColor }}>Restore Data</ThemedText>
            </TouchableOpacity>
    
            {/* Add more settings options here */}
          </ScrollView> {/* Close ScrollView */}
        </ThemedView>
      );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    settingOption: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc', // Or use a themed color
      width: '100%',
    },
  });