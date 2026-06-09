import React, { useState, useCallback, useImperativeHandle, forwardRef, memo, useRef } from 'react';
import { TextInput, StyleSheet, Pressable, View, Platform, AccessibilityInfo } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MAX_NOTES_LENGTH } from '@/utils/validation';

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

  // Animation value for shake
  const shake = useSharedValue(0);

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shake.value }],
    };
  });

  useImperativeHandle(ref, () => ({
    getNotes: () => notes,
    resetNotes: () => setNotes('')
  }));

  const handleNotesChange = useCallback((text: string) => {
    if (text.length > MAX_NOTES_LENGTH) {
        // Announce to screen readers since native maxLength is removed
        AccessibilityInfo.announceForAccessibility(`Maximum character limit of ${MAX_NOTES_LENGTH} reached`);

        // Trigger shake animation
        shake.value = withSequence(
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(-10, { duration: 50 }),
          withTiming(10, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );

        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        // Clamp text
        setNotes(text.slice(0, MAX_NOTES_LENGTH));
    } else {
        setNotes(text);
    }
  }, [shake]);

  const handleClear = useCallback(() => {
    setNotes('');
    inputRef.current?.focus();
  }, []);

  return (
    <ThemedView style={styles.section}>
      <ThemedText nativeID="notes-label" type="subtitle" style={{ color: headingColor, marginBottom: 10 }}>
        Notes 🗒️
      </ThemedText>
      <View style={styles.inputContainer}>
        <Animated.View style={shakeStyle}>
          <TextInput
          ref={inputRef}
          aria-labelledby="notes-label"
          style={[
            styles.notesInput,
            {
              color: textColor,
              borderColor: isFocused ? '#E63946' : borderColor,
              borderWidth: isFocused ? 2 : 1,
              ...Platform.select({
                web: {
                  outlineStyle: 'none'
                }
              })
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
            // Removed maxLength to allow custom handling with feedback
            // maxLength={MAX_NOTES_LENGTH}
          />
          {notes.length > 0 && (
            <Pressable
              style={({ pressed, hovered, focused }: any) => [
                styles.clearButton,
                pressed && { opacity: 0.7 },
                (hovered || focused) && { backgroundColor: 'rgba(0,0,0,0.05)' },
                Platform.OS === 'web' && focused && {
                  outlineStyle: 'solid',
                  outlineWidth: 2,
                  outlineColor: placeholderTextColor
                }
              ]}
              onPress={handleClear}
              accessibilityLabel="Clear notes"
              accessibilityHint="Clears the current notes"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              {...(Platform.OS === 'web' ? { title: 'Clear notes' } : {})}
            >
              <IconSymbol name="xmark.circle.fill" size={20} color={placeholderTextColor} />
            </Pressable>
          )}
        </Animated.View>
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
    borderRadius: 15,
  },
});
