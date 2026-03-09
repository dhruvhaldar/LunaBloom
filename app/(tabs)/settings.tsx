import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Alert, useColorScheme, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PeriodStorage } from '@/utils/storage';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ScreenCapture from 'expo-screen-capture';
import { isValidBackupEntry, sanitizeInput, MAX_BACKUP_FILE_SIZE } from '@/utils/validation';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Switch } from '@/components/ui/Switch';

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#f0f0f0' : '#413c58';

    // Optimization: Memoize header props to prevent re-rendering ParallaxScrollView header
    const headerBackgroundColor = useMemo(() => ({
        light: '#ffdde2',
        dark: '#151718'
    }), []);

    const headerImage = useMemo(() => (
        <Image
            source={require('@/assets/images/history2.png')}
            style={styles.reactLogo}
            resizeMode="contain"
        />
    ), []);
    
    // Add state for the two toggles
    const [lutealPhase, setLutealPhase] = useState(false);
    const [preventScreenshots, setPreventScreenshots] = useState(false);
    const [isImporting, setIsImporting] = useState(false);

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
              const existingEntries = await PeriodStorage.getEntries();
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

              // Show options dialog with Security Warning
              Alert.alert(
                '⚠️ Security Warning',
                'The backup file contains your personal health data in plain text. Please ensure you save it to a secure location (e.g., encrypted drive). Do you want to proceed?',
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => {
                      Alert.alert(
                        '❌ Backup Canceled',
                        'Backup was canceled.'
                      );
                    }
                  },
                  {
                    text: 'Proceed & Save',
                    style: 'destructive',
                    onPress: async () => {
                      // Create a temporary file path
                      const fileName = `period_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
                      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

                      try {
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
                      } catch (error: any) {
                        console.error('❌ Save/Share failed:', error instanceof Error ? error.message : String(error));
                        Alert.alert(
                          '❌ Backup Failed',
                          'There was an error saving your backup. Please try again.'
                        );
                      } finally {
                        // Security Cleanup: Delete the temporary file containing PHI
                        try {
                          await FileSystem.deleteAsync(fileUri, { idempotent: true });
                        } catch (deleteError) {
                          // Log error but don't alert user as the main task might have succeeded
                          console.error('⚠️ Failed to clean up temporary backup file:', deleteError instanceof Error ? deleteError.message : String(deleteError));
                        }
                      }
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
        let fileUri: string | null = null;
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return;
            }

            setIsImporting(true);
            const file = result.assets[0];
            fileUri = file.uri;

            // Security Check: Verify file size before reading to prevent DoS (OOM)
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists && fileInfo.size > MAX_BACKUP_FILE_SIZE) {
                Alert.alert(
                    '❌ File Too Large',
                    `The backup file exceeds the maximum allowed size of ${MAX_BACKUP_FILE_SIZE / (1024 * 1024)}MB.`
                );
                return;
            }

            // Security Improvement: Use FileSystem to read the file instead of fetch
            // fetch on file:// URIs can be inconsistent and FileSystem is safer for local reads
            const backupContent = await FileSystem.readAsStringAsync(fileUri);
            const backupData = JSON.parse(backupContent);

            // Validate backup data structure
            if (!backupData.version || !backupData.entries || !Array.isArray(backupData.entries)) {
                console.error('❌ Invalid backup file format');
                Alert.alert(
                    '❌ Invalid Backup',
                    'The selected file is not a valid backup file.'
                );
                return;
            }

            // Security: Validate each entry against schema
            const validEntries = backupData.entries.filter((entry: any) => isValidBackupEntry(entry));
            const invalidCount = backupData.entries.length - validEntries.length;

            // Security: Sanitize data to ensure consistency with input validation rules
            // This prevents bypassing filters (like control characters) via backup restore
            const sanitizedEntries = validEntries.map((entry: any) => ({
                ...entry,
                // Defense-in-depth: Sanitize all string inputs even if they passed validation
                notes: sanitizeInput(entry.notes),
                selectedFlow: entry.selectedFlow ? sanitizeInput(entry.selectedFlow) : entry.selectedFlow,
                selectedSymptoms: entry.selectedSymptoms.map((s: string) => sanitizeInput(s)),
                cycleLength: typeof entry.cycleLength === 'string' ? sanitizeInput(entry.cycleLength) : entry.cycleLength,
                periodDuration: typeof entry.periodDuration === 'string' ? sanitizeInput(entry.periodDuration) : entry.periodDuration
            }));

            if (invalidCount > 0) {
                 Alert.alert(
                    '⚠️ Warning',
                    `${invalidCount} entries were skipped because they were invalid or contained suspicious data.`
                );
            }

            if (sanitizedEntries.length === 0) {
                 Alert.alert(
                    '❌ Restore Failed',
                    'No valid entries found in the backup file.'
                );
                return;
            }

            // Store the entries in AsyncStorage
            await PeriodStorage.saveEntries(JSON.stringify(sanitizedEntries));
            
            Alert.alert(
                '✅ Restore Successful',
                `Successfully restored ${validEntries.length} entries!`
            );
        } catch (error: any) {
            console.error('❌ Restore failed with error:', error instanceof Error ? error.message : String(error));
            Alert.alert(
                '❌ Restore Failed',
                'There was an error restoring your backup. Please try again.'
            );
        } finally {
            setIsImporting(false);
            // Security Cleanup: Delete the temporary file imported to cache
            if (fileUri) {
                try {
                    await FileSystem.deleteAsync(fileUri, { idempotent: true });
                } catch (deleteError) {
                    console.error('⚠️ Failed to clean up temporary import file:', deleteError instanceof Error ? deleteError.message : String(deleteError));
                }
            }
        }
    };


    const aboutOption = async () => {
      Alert.alert('About', 'Made with ❤️ in India 🇮🇳');
    };

      return (
        <ParallaxScrollView
              headerBackgroundColor={headerBackgroundColor}
              headerImage={headerImage}
        >
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={[styles.title, { color: textColor }]}>Settings</ThemedText>

                {/* Other Settings Section */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Other Settings</ThemedText>
                    
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => handleLutealPhaseToggle(!lutealPhase)}
                        activeOpacity={0.7}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: lutealPhase }}
                        accessibilityLabel="Luteal Phase Calculation"
                        accessibilityHint="Improves ovulation prediction by using a 14-day phase."
                    >
                        <View style={styles.settingTextContainer}>
                            <ThemedText style={[styles.settingText, { color: textColor }]}>Luteal Phase Calculation</ThemedText>
                            <ThemedText style={[styles.settingDescription, { color: textColor }]}>
                                Improves ovulation prediction by using a 14-day phase.
                            </ThemedText>
                        </View>
                        <Switch
                            value={lutealPhase}
                            onValueChange={handleLutealPhaseToggle}
                            accessibilityLabel="Luteal Phase Calculation"
                            accessible={false}
                            pointerEvents="none"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={() => handleScreenshotToggle(!preventScreenshots)}
                        activeOpacity={0.7}
                        accessibilityRole="switch"
                        accessibilityState={{ checked: preventScreenshots }}
                        accessibilityLabel="Prevent Screenshots"
                        accessibilityHint="Blocks screen captures to protect your privacy."
                    >
                        <View style={styles.settingTextContainer}>
                            <ThemedText style={[styles.settingText, { color: textColor }]}>Prevent Screenshots</ThemedText>
                            <ThemedText style={[styles.settingDescription, { color: textColor }]}>
                                Blocks screen captures to protect your privacy.
                            </ThemedText>
                        </View>
                        <Switch
                            value={preventScreenshots}
                            onValueChange={handleScreenshotToggle}
                            accessibilityLabel="Prevent Screenshots"
                            accessible={false}
                            pointerEvents="none"
                        />
                    </TouchableOpacity>
                </View>

                {/* Backup Section */}
                <View style={styles.section}>
                    <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Data Management</ThemedText>
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            onPress={restoreData}
                            disabled={isImporting}
                            style={[styles.actionButton, { backgroundColor: '#457B9D', opacity: isImporting ? 0.7 : 1 }]}
                            accessibilityRole="button"
                            accessibilityLabel="Import data from file"
                            accessibilityHint="Restores your period history from a backup file"
                            accessibilityState={{ busy: isImporting, disabled: isImporting }}
                        >
                            {isImporting ? (
                                <ActivityIndicator color="#FFFFFF" style={{ marginRight: 8 }} />
                            ) : (
                                <IconSymbol name="square.and.arrow.down" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            )}
                            <ThemedText style={styles.actionButtonText}>{isImporting ? 'Importing...' : 'Import'}</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={backupData}
                            disabled={isImporting}
                            style={[styles.actionButton, { backgroundColor: '#E63946', opacity: isImporting ? 0.7 : 1 }]}
                            accessibilityRole="button"
                            accessibilityLabel="Export data to file"
                            accessibilityHint="Creates a backup file of your period history"
                            accessibilityState={{ disabled: isImporting }}
                        >
                            <IconSymbol name="square.and.arrow.up" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                            <ThemedText style={styles.actionButtonText}>Export</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* About Section */}
                <View style={styles.aboutSection}>
                    <TouchableOpacity
                        onPress={aboutOption}
                        style={styles.aboutButton}
                        accessibilityRole="button"
                        accessibilityLabel="About the app"
                    >
                         <IconSymbol name="info.circle" size={20} color="#457B9D" style={{ marginRight: 6 }} />
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
    settingTextContainer: {
        flex: 1,
        paddingRight: 16,
    },
    settingText: {
        fontSize: 17,
        color: '#ffffff',
        opacity: 0.9,
    },
    settingDescription: {
        fontSize: 13,
        opacity: 0.6,
        marginTop: 4,
        lineHeight: 18,
    },
    switch: {
        transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    aboutSection: {
        marginTop: 40,
        alignItems: 'center',
    },
    aboutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    aboutAppText: {
        fontSize: 17,
        color: '#457B9D',
    },
    versionText: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.5,
        marginTop: 4,
    },
    reactLogo: {
        height: 290,
        width: 760,
        alignSelf: 'center',
        marginBottom: -50,
        marginTop: -50,
    },
});