import React, { useState, useCallback, useImperativeHandle, forwardRef, memo, useRef } from 'react';
import { TextInput, StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { validateInputLength, MAX_NOTES_LENGTH } from '@/utils/validation';

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
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    getNotes: () => notes,
    resetNotes: () => setNotes('')
  }));

  const handleNotesChange = useCallback((text: string) => {
    if (!validateInputLength(text, MAX_NOTES_LENGTH)) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        return;
    }
    setNotes(text);
  }, []);

  const handleClear = useCallback(() => {
    setNotes('');
    inputRef.current?.focus();
  }, []);

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={{ color: headingColor, marginBottom: 10 }}>
        Notes 🗒️
      </ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={[
            styles.notesInput,
            {
              color: textColor,
              borderColor: isFocused ? '#E63946' : borderColor,
              borderWidth: isFocused ? 2 : 1,
            },
          ]}
          multiline
          value={notes}
          onChangeText={handleNotesChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Record any additional notes..."
          placeholderTextColor={placeholderTextColor}
          accessibilityLabel="Notes"
          accessibilityHint={`Maximum ${MAX_NOTES_LENGTH} characters`}
          maxLength={MAX_NOTES_LENGTH}
        />
        {notes.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            accessibilityLabel="Clear notes"
            accessibilityRole="button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="xmark.circle.fill" size={20} color={placeholderTextColor} />
          </TouchableOpacity>
        )}
      </View>
      <ThemedText
        style={{
          color: notes.length > MAX_NOTES_LENGTH * 0.9 ? '#E63946' : textColor,
          fontSize: 10,
          textAlign: 'right',
          fontWeight: notes.length > MAX_NOTES_LENGTH * 0.9 ? 'bold' : 'normal',
        }}
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
    paddingRight: 40,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    padding: 5,
  },
});
