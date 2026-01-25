import React, { useState, useCallback, useImperativeHandle, forwardRef, memo } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { validateInputLength, MAX_INPUT_LENGTH } from '@/utils/validation';

interface ChatInputProps {
  textColor: string;
  placeholderTextColor: string;
  isLoading: boolean;
  onSubmit: (text: string) => void;
}

export interface ChatInputHandle {
  getText: () => string;
  resetText: () => void;
  setText: (text: string) => void;
}

export const ChatInput = memo(forwardRef<ChatInputHandle, ChatInputProps>(({
  textColor,
  placeholderTextColor,
  isLoading,
  onSubmit
}, ref) => {
  const [text, setTextInternal] = useState('');

  useImperativeHandle(ref, () => ({
    getText: () => text,
    resetText: () => setTextInternal(''),
    setText: (newText: string) => setTextInternal(newText)
  }));

  const handleChangeText = useCallback((val: string) => {
    // Only update if within length limits
    if (!validateInputLength(val, MAX_INPUT_LENGTH)) {
        return;
    }
    setTextInternal(val);
  }, []);

  const handleSubmit = useCallback(() => {
    if (text.trim().length > 0) {
        onSubmit(text);
    }
  }, [text, onSubmit]);

  return (
    <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder="Ask a menstrual health question..."
        placeholderTextColor={placeholderTextColor}
        value={text}
        onChangeText={handleChangeText}
        editable={!isLoading}
        accessibilityLabel="Ask a menstrual health question"
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
    />
  );
}));

const styles = StyleSheet.create({
  input: {
    height: 60,
    borderColor: '#E63946',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
});
