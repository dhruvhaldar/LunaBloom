import React from 'react';
import { 
  StyleSheet, 
  View, 
  Alert, 
  useColorScheme, 
  TouchableOpacity,
  ScrollView,
  Image,
  Share
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
    const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';
    

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
              const entries = JSON.parse(existingEntries);
              
              // Check if entries array is empty
              if (!Array.isArray(entries) || entries.length === 0) {
                console.log('⚠️ Entries array is empty');
                Alert.alert(
                  'No Data to Backup',
                  'Please log at least one period entry before backing up.'
                );
                return;
              }

              console.log(`📊 Found ${entries.length} entries to backup`);
              
              const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                entries: entries
              };

              console.log('📝 Creating backup JSON...');
              const backupJson = JSON.stringify(backup, null, 2);

              // Show options dialog
              Alert.alert(
                'Backup Options',
                'How would you like to backup your data?',
                [
                  {
                    text: 'Share Directly',
                    onPress: async () => {
                      console.log('📤 Opening share dialog...');
                      await Share.share({
                        message: backupJson,
                        title: 'Period Tracker Backup'
                      });
                      console.log('🎉 Share completed successfully!');
                      Alert.alert(
                        '✅ Backup Successful',
                        'Your period data has been shared successfully!'
                      );
                    }
                  },
                  {
                    text: 'Save to File',
                    onPress: async () => {
                      Alert.alert(
                        'File Permission Required',
                        'This option requires permission to save files to your device. Would you like to continue?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel'
                          },
                          {
                            text: 'Continue',
                            onPress: async () => {
                              try {
                                console.log('💾 Preparing file for saving...');
                                
                                // Create a temporary file
                                const fileName = `period_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
                                const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
                                
                                // Write the backup data to the temporary file
                                await FileSystem.writeAsStringAsync(fileUri, backupJson);
                                
                                // Check if sharing is available
                                const isAvailable = await Sharing.isAvailableAsync();
                                if (!isAvailable) {
                                  throw new Error('Sharing is not available on this device');
                                }

                                // Share the file (this will open the system's save/share dialog)
                                await Sharing.shareAsync(fileUri, {
                                  mimeType: 'application/json',
                                  dialogTitle: 'Save Period Tracker Backup',
                                  UTI: 'public.json' // iOS only
                                });
                                
                                console.log('✅ File saved successfully!');
                                Alert.alert(
                                  '✅ Backup Successful',
                                  'Your period data has been saved successfully!'
                                );
                              } catch (error) {
                                console.error('❌ Save failed with error:', error);
                                Alert.alert(
                                  '❌ Save Failed',
                                  'There was an error saving your backup. Please try again.'
                                );
                              }
                            }
                          }
                        ]
                      );
                    }
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
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
        console.log('🔄 Starting restore process...');
        try {
            console.log('📂 Opening file picker...');
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                console.log('❌ File picking was canceled');
                return;
            }

            console.log('📄 Reading selected file...');
            const file = result.assets[0];
            const response = await fetch(file.uri);
            const backupData = await response.json();

            // Validate backup data structure
            if (!backupData.version || !backupData.entries || !Array.isArray(backupData.entries)) {
                console.error('❌ Invalid backup file format');
                Alert.alert(
                    '❌ Invalid Backup',
                    'The selected file is not a valid backup file.'
                );
                return;
            }

            console.log(`📊 Found ${backupData.entries.length} entries to restore`);
            
            // Store the entries in AsyncStorage
            await AsyncStorage.setItem('periodEntries', JSON.stringify(backupData.entries));
            
            console.log('✅ Data restored successfully!');
            Alert.alert(
                '✅ Restore Successful',
                `Successfully restored ${backupData.entries.length} entries!`
            );
        } catch (error) {
            console.error('❌ Restore failed with error:', error);
            Alert.alert(
                '❌ Restore Failed',
                'There was an error restoring your backup. Please try again.'
            );
        }
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
                <ThemedText type="title" style={[styles.header, { color: textColor }]}>Settings</ThemedText>

                {/* Backup Section */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Backup</ThemedText>
                    <View style={styles.settingRow}>
                        <ThemedText style={[styles.settingText, { color: textColor }]}>Saved Data</ThemedText>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity onPress={restoreData}>
                                <ThemedText style={[styles.link, { color: '#81b0ff', marginRight: 10 }]}>Import</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={backupData}>
                                <ThemedText style={[styles.link, { color: '#81b0ff' }]}>Export</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <TouchableOpacity onPress={aboutOption} style={styles.aboutButton}>
                        <ThemedText style={[styles.link, { color: '#81b0ff' }]}>About App</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={[styles.versionText, { color: textColor }]}>
                        App Version: 1.9.3 | DB-version: 8
                    </ThemedText>
                </View>
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
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#2f2f2f',
    },
    settingText: {
        fontSize: 16,
    },
    link: {
        fontSize: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aboutSection: {
        marginTop: 32,
        alignItems: 'center',
    },
    aboutButton: {
        marginBottom: 8,
    },
    versionText: {
        fontSize: 14,
        opacity: 0.7,
    },
    reactLogo: {
        height: 290,
        width: 760,
        alignSelf: 'center',
        marginBottom: -50,
        marginTop: -50,
    },
});