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
    const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';

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
    },
  });