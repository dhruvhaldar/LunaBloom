import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, useColorScheme, TouchableOpacity, Image, Share,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ScreenCapture from 'expo-screen-capture';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';

interface ToggleSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    accessibilityLabel: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ value, onValueChange, accessibilityLabel }) => {
    return (
        <TouchableOpacity 
            onPress={() => onValueChange(!value)} 
            style={[styles.toggleContainer, value ? styles.toggleContainerActive : styles.toggleContainerInactive]}
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            accessibilityLabel={accessibilityLabel}
        >
            <View style={[styles.toggleCircle, value ? styles.toggleCircleActive : styles.toggleCircleInactive]} />
        </TouchableOpacity>
    );
};

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';
    const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';
    
    // Add state for the two toggles
    const [lutealPhase, setLutealPhase] = useState(false);
    const [preventScreenshots, setPreventScreenshots] = useState(false);

    // Load saved settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [savedLutealPhase, savedScreenshotSetting] = await Promise.all([
                    AsyncStorage.getItem('lutealPhase'),
                    AsyncStorage.getItem('preventScreenshots')
                ]);

                if (savedLutealPhase !== null) {
                    setLutealPhase(JSON.parse(savedLutealPhase));
                }
                
                if (savedScreenshotSetting !== null) {
                    const isEnabled = JSON.parse(savedScreenshotSetting);
                    setPreventScreenshots(isEnabled);
                    if (isEnabled) {
                        await ScreenCapture.preventScreenCaptureAsync();
                    }
                }
            } catch (error: any) {
                console.error('Error loading settings:', error instanceof Error ? error.message : String(error));
            }
        };
        loadSettings();
    }, []);

    // Handle luteal phase toggle
    const handleLutealPhaseToggle = async (value: boolean) => {
        try {
            setLutealPhase(value);
            await AsyncStorage.setItem('lutealPhase', JSON.stringify(value));
            
            // Show information alert when enabling luteal phase
            if (value) {
                Alert.alert(
                    'Luteal Phase Calculation Enabled',
                    'Your cycle predictions will now include luteal phase calculations. The luteal phase is the time between ovulation and the start of your next period, typically lasting 14 days.',
                    [{ text: 'Got it!' }]
                );
            }
        } catch (error: any) {
            console.error('Error saving luteal phase setting:', error instanceof Error ? error.message : String(error));
            // Revert the toggle if there's an error
            setLutealPhase(!value);
            Alert.alert('Error', 'Failed to update luteal phase setting');
        }
    };

    // Handle screenshot prevention toggle
    const handleScreenshotToggle = async (value: boolean) => {
        try {
            setPreventScreenshots(value);
            if (value) {
                await ScreenCapture.preventScreenCaptureAsync();
            } else {
                await ScreenCapture.allowScreenCaptureAsync();
            }
            await AsyncStorage.setItem('preventScreenshots', JSON.stringify(value));
        } catch (error: any) {
            console.error('Error toggling screenshot prevention:', error instanceof Error ? error.message : String(error));
            // Revert the toggle if there's an error
            setPreventScreenshots(!value);
            Alert.alert('Error', 'Failed to update screenshot settings');
        }
    };

    const backupData = async () => {
            try {
              const existingEntries = await AsyncStorage.getItem('periodEntries');
              if (!existingEntries) {
                Alert.alert('No data to backup', 'Please log at least one entry.');
                return;
              }

              const entries = JSON.parse(existingEntries);
              
              // Check if entries array is empty
              if (!Array.isArray(entries) || entries.length === 0) {
                Alert.alert(
                  'No Data to Backup',
                  'Please log at least one period entry before backing up.'
                );
                return;
              }

              const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                entries: entries
              };

              const backupJson = JSON.stringify(backup, null, 2);

              // Show options dialog
              Alert.alert(
                'Save Backup',
                'Would you like to save your data backup?',
                [
                  {
                    text: 'Save',
                    onPress: async () => {
                      try {
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
                        }).catch((error: any) => {
                          console.error('❌ Share failed with error:', error instanceof Error ? error.message : String(error));
                          Alert.alert(
                            '❌ Backup Failed',
                            'There was an error sharing your backup. Please try again.'
                          );
                        });
                      } catch (error: any) {
                        console.error('❌ Save failed with error:', error instanceof Error ? error.message : String(error));
                        Alert.alert(
                          '❌ Save Failed',
                          'There was an error saving your backup. Please try again.'
                        );
                      }
                    }
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                      Alert.alert(
                        '❌ Backup Failed',
                        'Backup was canceled.'
                      );
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('❌ Backup failed with error:', error instanceof Error ? error.message : String(error));
              Alert.alert(
                '❌ Backup Failed',
                'There was an error creating your backup. Please try again.'
              );
            }
      };
      

    const restoreData = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return;
            }

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

            // Store the entries in AsyncStorage
            await AsyncStorage.setItem('periodEntries', JSON.stringify(backupData.entries));
            
            Alert.alert(
                '✅ Restore Successful',
                `Successfully restored ${backupData.entries.length} entries!`
            );
        } catch (error: any) {
            console.error('❌ Restore failed with error:', error instanceof Error ? error.message : String(error));
            Alert.alert(
                '❌ Restore Failed',
                'There was an error restoring your backup. Please try again.'
            );
        }
    };


    const aboutOption = async () => {
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
                <ThemedText type="title" style={[styles.title, { color: textColor }]}>Settings</ThemedText>

                {/* Other Settings Section */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Other Settings</ThemedText>
                    
                    <View style={styles.settingRow}>
                        <ThemedText style={[styles.settingText, { color: textColor }]}>Luteal Phase Calculation</ThemedText>
                        <ToggleSwitch
                            value={lutealPhase}
                            onValueChange={handleLutealPhaseToggle}
                            accessibilityLabel="Luteal Phase Calculation"
                        />
                    </View>

                    <View style={styles.settingRow}>
                        <ThemedText style={[styles.settingText, { color: textColor }]}>Prevent Screenshots</ThemedText>
                        <ToggleSwitch
                            value={preventScreenshots}
                            onValueChange={handleScreenshotToggle}
                            accessibilityLabel="Prevent Screenshots"
                        />
                    </View>
                </View>

                {/* Backup Section */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Backup</ThemedText>
                    <View style={styles.settingRow}>
                        <ThemedText style={[styles.settingText, { color: textColor }]}>Period Entries</ThemedText>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity onPress={restoreData}>
                                <ThemedText style={styles.actionButtonText}>Import</ThemedText>
                            </TouchableOpacity>
                            <ThemedText style={styles.separator}>|</ThemedText>
                            <TouchableOpacity onPress={backupData}>
                                <ThemedText style={styles.actionButtonText}>Export</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <TouchableOpacity onPress={aboutOption}>
                        <ThemedText style={styles.aboutAppText}>About</ThemedText>
                    </TouchableOpacity>
                    <ThemedText style={[styles.versionText, { color: textColor }]}>
                        App Version: 2.1-beta
                    </ThemedText>
                </View>
            </ThemedView>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
      textAlign: 'center',
      marginBottom: 20,
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 20,
        color: '#ffffff',
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    settingText: {
        fontSize: 17,
        color: '#ffffff',
        opacity: 0.9,
    },
    switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 17,
        color: '#457B9D',
        paddingHorizontal: 10,
    },
    separator: {
        fontSize: 17,
        color: '#457B9D',
        opacity: 0.5,
        marginHorizontal: 5,
    },
    aboutSection: {
        marginTop: 40,
        alignItems: 'center',
    },
    aboutAppText: {
        fontSize: 17,
        color: '#457B9D',
        marginBottom: 10,
    },
    versionText: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.5,
    },
    reactLogo: {
        height: 290,
        width: 760,
        alignSelf: 'center',
        marginBottom: -50,
        marginTop: -50,
    },
    toggleContainer: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    toggleContainerActive: {
        backgroundColor: '#457B9D',
    },
    toggleContainerInactive: {
        backgroundColor: '#3f3f3f',
    },
    toggleCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        position: 'absolute',
    },
    toggleCircleActive: {
        backgroundColor: '#ffffff',
        right: 2,
    },
    toggleCircleInactive: {
        backgroundColor: '#909090',
        left: 2,
    },
});