import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { TextInput, View, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
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

  return (
    <View style={styles.inputContainer}>
        <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="Ask a menstrual health question..."
            placeholderTextColor={placeholderTextColor}
            value={text}
            onChangeText={setText}
            editable={!isLoading}
            accessibilityLabel="Ask a menstrual health question"
            returnKeyType="send"
            onSubmitEditing={handleSubmit}
            maxLength={MAX_INPUT_LENGTH}
        />
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

const styles = StyleSheet.create({
  inputContainer: {
    marginTop: 10,
  },
  input: {
    height: 60,
    borderColor: '#E63946',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
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
