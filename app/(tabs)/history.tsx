import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, Alert, useColorScheme, Platform, UIManager, Vibration, LayoutAnimation, ActivityIndicator } from 'react-native';
// Remove direct AsyncStorage import
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { PeriodStorage } from '@/utils/storage';
import { ThemedText } from '@/components/ThemedText';
import ParallaxFlatList from '@/components/ParallaxFlatList';
import { useRouter } from 'expo-router';
import { Image } from 'react-native';
import HistoryItem, { HistoryEntry } from '@/components/HistoryItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePeriodEntries } from '@/hooks/usePeriodEntries';

export default function TabTwoScreen() {
  const router = useRouter();
  // Security: usePeriodEntries hook ensures PHI is cleared from memory when backgrounded
  const { entries: rawEntries, isLoading, setEntries } = usePeriodEntries();
  
  // Sort entries for display
  const entries = useMemo(() => {
    const sorted = [...rawEntries];
    sorted.sort((a, b) => b.lastPeriod.localeCompare(a.lastPeriod));
    return sorted;
  }, [rawEntries]);

  // Color Scheme
  const colorScheme = useColorScheme();
  const Parallaxheaderlightcolor = '#A8DADC';
  const Parallaxheaderdarkcolor = '#A8DADC';
  const sectionHeadingtextColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const deleteIconColor = colorScheme === 'dark' ? '#F1FAEE' : '#E63946';
  
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
                const newEntriesString = JSON.stringify(updatedEntries);

                // Bolt Optimization: Use PeriodStorage to save and update cache
                PeriodStorage.saveEntries(newEntriesString).catch(err =>
                  console.error('Failed to persist deletion', err instanceof Error ? err.message : String(err))
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
  }, [setEntries]);

  const renderItem = useCallback(({ item }: { item: HistoryEntry }) => (
    <HistoryItem
      item={item}
      onDelete={handleDelete}
      textColor={textColor}
      deleteIconColor={deleteIconColor}
    />
  ), [handleDelete, textColor, deleteIconColor]);

  // Optimization: Stable key extractor
  const keyExtractor = useCallback((item: HistoryEntry) => item.date, []);

  // Optimization: Stable empty state action handler
  const handleEmptyAction = useCallback(() => {
    router.push('/');
  }, [router]);

  // Optimization: Memoize empty state component to prevent re-mounting/re-rendering
  const emptyState = useMemo(() => (
    isLoading ? (
       <ActivityIndicator
         size="large"
         color={textColor}
         style={{ marginTop: 20 }}
         accessibilityLabel="Loading period history"
         accessibilityRole="progressbar"
       />
    ) : (
      <EmptyState
        title="No Entries Yet"
        message="Track your first period to start seeing your history here."
        icon="clock.fill"
        actionLabel="Log Period"
        actionHint="Navigates to the home screen to log a new period"
        onAction={handleEmptyAction}
      />
    )
  ), [isLoading, textColor, handleEmptyAction]);
 
  // Optimization: Memoize the list header to ensure referential stability.
  // This prevents the ParallaxFlatList (and underlying FlatList) from unmounting/remounting
  // the header component on every render (e.g. when entries update), avoiding visual glitches.
  const listHeader = useMemo(() => (
    <View style={styles.entriesContainer}>
      <ThemedText type="title" style={[styles.header, { color: textColor }]}>History</ThemedText>

      <ThemedText
        type="subtitle"
        style={{ color: sectionHeadingtextColor , marginBottom: 10}}
      >
        Logged Entries 📝
      </ThemedText>
    </View>
  ), [textColor, sectionHeadingtextColor]);

  // Optimization: Memoize background color object to avoid referential changes
  const headerBackgroundColor = useMemo(() => ({
    light: Parallaxheaderlightcolor,
    dark: Parallaxheaderdarkcolor
  }), [Parallaxheaderlightcolor, Parallaxheaderdarkcolor]);

  // Optimization: Memoize header image to prevent unnecessary re-rendering of ParallaxFlatList header
  const headerImage = useMemo(() => (
    <Image
      source={require('@/assets/images/history2.png')}
      style={styles.reactLogo}
      resizeMode="contain"
      accessible={false}
      importantForAccessibility="no"
    />
  ), []);

  return (
    <ParallaxFlatList
      headerBackgroundColor={headerBackgroundColor}
      headerImage={headerImage}
      data={entries}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={emptyState}
      contentContainerStyle={styles.listContent}
    />
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
  },
  listContent: {
    paddingHorizontal: 32,
    paddingBottom: 120,
  },
});
