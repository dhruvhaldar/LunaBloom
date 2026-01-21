import React, { useState, useCallback, useImperativeHandle, forwardRef, memo } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { validateInputLength, MAX_NOTES_LENGTH } from '@/utils/validation';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface NotesInputProps {
  textColor: string;
  borderColor: string;
  placeholderTextColor: string;
  headingColor: string;
}

export interface NotesInputHandle {
  getNotes: () => string;
  resetNotes: () => void;
}

export const NotesInput = memo(forwardRef<NotesInputHandle, NotesInputProps>(({
  textColor,
  borderColor,
  placeholderTextColor,
  headingColor
}, ref) => {
  const [notes, setNotes] = useState('');

  useImperativeHandle(ref, () => ({
    getNotes: () => notes,
    resetNotes: () => setNotes('')
  }));

  const handleNotesChange = useCallback((text: string) => {
    if (!validateInputLength(text, MAX_NOTES_LENGTH)) {
        return;
    }
    setNotes(text);
  }, []);

  const handleClear = useCallback(() => {
    setNotes('');
  }, []);

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={{ color: headingColor, marginBottom: 10 }}>
        Notes 🗒️
      </ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.notesInput, { color: textColor, borderColor: borderColor }]}
          multiline
          value={notes}
          onChangeText={handleNotesChange}
          placeholder="Record any additional notes..."
          placeholderTextColor={placeholderTextColor}
          accessibilityLabel="Notes"
          accessibilityHint={`Maximum ${MAX_NOTES_LENGTH} characters`}
          maxLength={MAX_NOTES_LENGTH}
        />
        {notes.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            accessibilityLabel="Clear notes"
            accessibilityRole="button"
          >
            <IconSymbol
              name="xmark.circle.fill"
              size={20}
              color={placeholderTextColor}
            />
          </TouchableOpacity>
        )}
      </View>
      <ThemedText
        style={{ color: textColor, fontSize: 10, textAlign: 'right' }}
        accessibilityLabel={`${notes.length} characters used out of ${MAX_NOTES_LENGTH}`}
      >
        {notes.length}/{MAX_NOTES_LENGTH}
      </ThemedText>
    </ThemedView>
  );
}));

const styles = StyleSheet.create({
  section: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    paddingRight: 40, // Make room for clear button
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 1,
  },
});
