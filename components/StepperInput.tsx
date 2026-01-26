import React, { useCallback, memo } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, Platform, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface StepperInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  label: string;
  style?: StyleProp<ViewStyle>;
}

// Optimization: Use memo to prevent re-renders when parent state changes (e.g. typing notes)
// but stepper props (value, handlers) remain stable.
export const StepperInput = memo(function StepperInput({
  value,
  onChangeText,
  onBlur,
  min = 0,
  max = 100,
  label,
  style
}: StepperInputProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = textColor;

  const handleIncrement = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const currentVal = parseInt(value, 10);
    const newValue = isNaN(currentVal) ? min : currentVal + 1;
    if (newValue <= max) {
      onChangeText(newValue.toString());
    }
  }, [value, max, min, onChangeText]);

  const handleDecrement = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const currentVal = parseInt(value, 10);
    const newValue = isNaN(currentVal) ? min : currentVal - 1;
    if (newValue >= min) {
      onChangeText(newValue.toString());
    }
  }, [value, min, onChangeText]);

  const numericValue = parseInt(value, 10);
  const isAtMin = !isNaN(numericValue) && numericValue <= min;
  const isAtMax = !isNaN(numericValue) && numericValue >= max;

  // Security: Prevent DoS by limiting input length.
  // Using a safe limit (20) that accommodates negatives, decimals, and reasonably large numbers
  // while still preventing massive paste attacks.
  const maxLength = 20;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handleDecrement}
        style={[styles.button, { borderColor, opacity: isAtMin ? 0.5 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        disabled={isAtMin}
      >
        <IconSymbol name="minus" size={20} color={textColor} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: textColor, borderColor }]}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        maxLength={maxLength}
        accessibilityLabel={label}
        accessibilityRole="spinbutton"
        accessibilityValue={{ min, max, now: numericValue || 0 }}
      />

      <TouchableOpacity
        onPress={handleIncrement}
        style={[styles.button, { borderColor, opacity: isAtMax ? 0.5 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        disabled={isAtMax}
      >
        <IconSymbol name="plus" size={20} color={textColor} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: 60,
    textAlign: 'center',
    fontSize: 16,
    height: 44,
  },
});
