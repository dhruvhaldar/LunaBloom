import React, { useState, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { TextInput, View, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedText } from './ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { MAX_INPUT_LENGTH } from '@/utils/validation';

export interface ChatInputHandle {
  getText: () => string;
  setText: (text: string) => void;
  clear: () => void;
}

interface ChatInputProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
  textColor: string;
  placeholderTextColor: string;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(({ onSubmit, isLoading, textColor, placeholderTextColor }, ref) => {
  const [text, setText] = useState('');
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
    getText: () => text,
    setText: (t: string) => setText(t),
    clear: () => setText(''),
  }));

  const isInputEmpty = text.trim().length === 0;
  const isButtonDisabled = isLoading || isInputEmpty;

  const handleSubmit = () => {
    if (!isButtonDisabled) {
      onSubmit(text.trim());
      setText(''); // Auto-clear on submit
    }
  };

  const handleTextChange = (newText: string) => {
    if (newText.length > MAX_INPUT_LENGTH) {
      // Trigger shake animation
      shake.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      // Haptic feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      // Clamp text
      setText(newText.slice(0, MAX_INPUT_LENGTH));
    } else {
      setText(newText);
    }
  };

  const handleClear = useCallback(() => {
    setText('');
    inputRef.current?.focus();
  }, []);

  return (
    <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Animated.View style={shakeStyle}>
            <TextInput
                ref={inputRef}
                style={[
                    styles.input,
                    {
                        color: textColor,
                        borderWidth: isFocused ? 2 : 1,
                        paddingRight: 40, // Add padding for clear button
                        ...Platform.select({
                            web: {
                                outlineStyle: 'none'
                            }
                        })
                    }
                ]}
                placeholder="Ask a menstrual health question..."
                placeholderTextColor={placeholderTextColor}
                value={text}
                onChangeText={handleTextChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                editable={!isLoading}
                accessibilityLabel="Ask a menstrual health question"
                accessibilityHint="Double tap to enter text. Submit sends the question."
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                // Removed maxLength to allow custom handling with feedback
                // maxLength={MAX_INPUT_LENGTH}
            />
            {text.length > 0 && !isLoading && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClear}
                accessibilityLabel="Clear question"
                accessibilityRole="button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol name="xmark.circle.fill" size={20} color={placeholderTextColor} />
              </TouchableOpacity>
            )}
          </Animated.View>
          {text.length > 0 && (
            <ThemedText
              style={{
                textAlign: 'right',
                fontSize: 12,
                marginTop: 4,
                marginRight: 5,
                color: text.length > MAX_INPUT_LENGTH * 0.9 ? '#E63946' : placeholderTextColor,
                fontWeight: text.length >= MAX_INPUT_LENGTH ? 'bold' : 'normal',
              }}
            >
              {text.length}/{MAX_INPUT_LENGTH}
            </ThemedText>
          )}
        </View>

        <TouchableOpacity
            style={[styles.button, isButtonDisabled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isButtonDisabled}
            accessibilityLabel="Send question to AI assistant"
            accessibilityRole="button"
            accessibilityState={{ disabled: isButtonDisabled, busy: isLoading }}
        >
            {isLoading ? <ActivityIndicator color="#F1FAEE" /> : <ThemedText style={styles.buttonText}>Ask 🔍</ThemedText>}
        </TouchableOpacity>
    </View>
  );
});

ChatInput.displayName = 'ChatInput';

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    height: 60,
    borderColor: '#E63946',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 0, // Reset default margin since it's on wrapper now
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 15, // Vertically centered (60 - 30) / 2
    padding: 5,
  },
  button: {
    backgroundColor: '#E63946',
    padding: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
