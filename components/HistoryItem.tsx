import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { formatDate } from '@/utils/dateFormatter';
import { ThemedText } from '@/components/ThemedText';

// Define the shape of an entry based on usage in history.tsx
export interface HistoryEntry {
  date: string;
  lastPeriod: string;
  cycleLength: number;
  periodDuration?: number | string;
  selectedSymptoms: string[];
  selectedFlow: string | null;
  notes: string;
  predictedNextPeriod?: string | null;
  predictedNextOvulation?: string | null;
}

interface HistoryItemProps {
  item: HistoryEntry;
  onDelete: (date: string) => void;
  textColor: string;
  deleteIconColor: string;
}

const arePropsEqual = (prevProps: HistoryItemProps, nextProps: HistoryItemProps) => {
  // Check stable props
  if (
    prevProps.onDelete !== nextProps.onDelete ||
    prevProps.textColor !== nextProps.textColor ||
    prevProps.deleteIconColor !== nextProps.deleteIconColor
  ) {
    return false;
  }

  // Check item deep equality
  const prevItem = prevProps.item;
  const nextItem = nextProps.item;

  // Optimized check: if references are same, return true immediately
  if (prevItem === nextItem) return true;

  // Check unique ID first (date is creation timestamp)
  if (prevItem.date !== nextItem.date) return false;

  return (
    prevItem.lastPeriod === nextItem.lastPeriod &&
    prevItem.cycleLength === nextItem.cycleLength &&
    prevItem.selectedFlow === nextItem.selectedFlow &&
    prevItem.notes === nextItem.notes &&
    // Check symptoms array content
    prevItem.selectedSymptoms.length === nextItem.selectedSymptoms.length &&
    prevItem.selectedSymptoms.every((symptom, index) => symptom === nextItem.selectedSymptoms[index])
  );
};

const HistoryItem = React.memo(function HistoryItem({ item, onDelete, textColor, deleteIconColor }: HistoryItemProps) {
  // Format dates once per render
  // Optimization: useMemo derived values to prevent expensive Date parsing and string formatting on every render
  const lastPeriodDate = useMemo(() => {
    return formatDate(item.lastPeriod);
  }, [item.lastPeriod]);

  const logDate = useMemo(() => {
    return formatDate(item.date);
  }, [item.date]);

  const symptomsString = useMemo(() => {
    return item.selectedSymptoms.join(', ');
  }, [item.selectedSymptoms]);

  const accessibilityLabel = useMemo(() => {
    let label = `Entry for ${lastPeriodDate}. Cycle Length: ${item.cycleLength} days.`;
    if (symptomsString) label += ` Symptoms: ${symptomsString}.`;
    if (item.selectedFlow) label += ` Flow: ${item.selectedFlow}.`;
    if (item.notes) label += ` Notes: ${item.notes}.`;
    label += ` Log Date: ${logDate}`;
    return label;
  }, [lastPeriodDate, item.cycleLength, symptomsString, item.selectedFlow, item.notes, logDate]);

  return (
    <View style={styles.entry}>
      <View style={styles.entryContent}>
        <View
          style={styles.entryTextContainer}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
        >
          <ThemedText style={{ color: textColor }}>🗓️ Last Period: {lastPeriodDate}</ThemedText>
          <ThemedText style={{ color: textColor }}>🔄 Cycle Length: {item.cycleLength} days</ThemedText>
          {symptomsString ? (
             <ThemedText style={{ color: textColor }}>🤒 Symptoms: {symptomsString}</ThemedText>
          ) : null}
          {item.selectedFlow ? (
             <ThemedText style={{ color: textColor }}>🩸 Flow: {item.selectedFlow}</ThemedText>
          ) : null}
          {item.notes ? (
            <ThemedText style={{ color: textColor }}>📝 Notes: {item.notes}</ThemedText>
          ) : null}
          <ThemedText style={{ color: textColor }}>🕒 Log Date: {logDate}</ThemedText>
        </View>

        <Pressable
          style={({ pressed, hovered, focused }: any) => [
            styles.deleteIconContainer,
            pressed && { opacity: 0.7 },
            (hovered || focused) && { backgroundColor: 'rgba(230, 57, 70, 0.1)' },
            Platform.OS === 'web' && focused && {
              outlineStyle: 'solid',
              outlineWidth: 2,
              outlineColor: deleteIconColor
            }
          ]}
          onPress={() => onDelete(item.date)}
          accessibilityLabel={`Delete entry from ${logDate}`}
          accessibilityRole="button"
        >
          <IconSymbol name="trash.fill" size={24} color={deleteIconColor} />
        </Pressable>
      </View>
    </View>
  );
}, arePropsEqual);

const styles = StyleSheet.create({
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
    borderRadius: 8,
  },
});

export default HistoryItem;
