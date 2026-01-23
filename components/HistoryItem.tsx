import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { formatDate } from '@/utils/dateFormatter';

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
    return [
      `Entry logged on ${logDate}`,
      `Last Period: ${lastPeriodDate}`,
      `Cycle Length: ${item.cycleLength} days`,
      `Symptoms: ${symptomsString || 'None'}`,
      `Flow: ${item.selectedFlow || 'Not logged'}`,
      item.notes ? `Notes: ${item.notes}` : null
    ].filter(Boolean).join('. ');
  }, [logDate, lastPeriodDate, item.cycleLength, symptomsString, item.selectedFlow, item.notes]);

  return (
    <View style={styles.entry}>
      <View style={styles.entryContent}>
        <View
          style={styles.entryTextContainer}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
        >
          <Text style={{ color: textColor }}>Last Period: {lastPeriodDate}</Text>
          <Text style={{ color: textColor }}>Cycle Length: {item.cycleLength} days</Text>
          <Text style={{ color: textColor }}>Symptoms: {symptomsString}</Text>
          <Text style={{ color: textColor }}>Flow: {item.selectedFlow || 'Not logged'}</Text>
          <Text style={{ color: textColor }}>Notes: {item.notes}</Text>
          <Text style={{ color: textColor }}>Log Date: {logDate}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteIconContainer}
          onPress={() => onDelete(item.date)}
          accessibilityLabel={`Delete entry from ${logDate}`}
          accessibilityRole="button"
        >
          <IconSymbol name="trash.fill" size={24} color={deleteIconColor} />
        </TouchableOpacity>
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
  },
});

export default HistoryItem;
