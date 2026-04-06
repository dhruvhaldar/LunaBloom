import React, { useCallback, memo, useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Pressable,
  View,
  Platform,
  ViewStyle,
  StyleProp,
} from 'react-native';
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
  "aria-labelledby"?: string;
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
  style,
  "aria-labelledby": ariaLabelledBy,
}: StepperInputProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = textColor;
  const [isFocused, setIsFocused] = useState(false);

  // Ref to track value for interval callbacks to avoid stale closures
  const valueRef = useRef(value);
  if (valueRef.current !== value) {
    valueRef.current = value;
  }

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const performIncrement = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const currentVal = parseInt(valueRef.current, 10);
    const newValue = isNaN(currentVal) ? min : currentVal + 1;
    if (newValue <= max) {
      onChangeText(newValue.toString());
    }
  }, [max, min, onChangeText]);

  const performDecrement = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const currentVal = parseInt(valueRef.current, 10);
    const newValue = isNaN(currentVal) ? min : currentVal - 1;
    if (newValue >= min) {
      onChangeText(newValue.toString());
    }
  }, [min, onChangeText]);

  const startRapidIncrement = useCallback(() => {
    timerRef.current = setInterval(performIncrement, 100);
  }, [performIncrement]);

  const startRapidDecrement = useCallback(() => {
    timerRef.current = setInterval(performDecrement, 100);
  }, [performDecrement]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  const numericValue = parseInt(value, 10);
  const isAtMin = !isNaN(numericValue) && numericValue <= min;
  const isAtMax = !isNaN(numericValue) && numericValue >= max;

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={performDecrement}
        onLongPress={startRapidDecrement}
        onPressOut={stopTimer}
        style={({ pressed, hovered, focused }: any) => [
          styles.button,
          {
            borderColor,
            opacity: isAtMin ? 0.5 : pressed ? 0.7 : 1,
            backgroundColor: (hovered || focused) && !isAtMin ? 'rgba(0,0,0,0.05)' : 'transparent',
            ...(Platform.OS === 'web' && focused && { outlineStyle: 'solid', outlineWidth: 2, outlineColor: '#E63946', outlineOffset: 2 })
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Decrease ${label}`}
        accessibilityHint={isAtMin ? 'Minimum value reached' : undefined}
        accessibilityState={{ disabled: isAtMin }}
        disabled={isAtMin}
        delayLongPress={300}
      >
        <IconSymbol name="minus" size={20} color={textColor} />
      </Pressable>

      <TextInput
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: isFocused ? '#E63946' : borderColor,
            borderWidth: isFocused ? 2 : 1,
            ...Platform.select({
              web: {
                outlineStyle: 'none',
              },
            }),
          },
        ]}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        onBlur={handleBlur}
        onFocus={handleFocus}
        accessibilityLabel={label}
        accessibilityRole="spinbutton"
        accessibilityValue={{ min, max, now: numericValue || 0 }}
        aria-labelledby={ariaLabelledBy}
        selectTextOnFocus={true}
        returnKeyType="done"
        maxLength={3}
      />

      <Pressable
        onPress={performIncrement}
        onLongPress={startRapidIncrement}
        onPressOut={stopTimer}
        style={({ pressed, hovered, focused }: any) => [
          styles.button,
          {
            borderColor,
            opacity: isAtMax ? 0.5 : pressed ? 0.7 : 1,
            backgroundColor: (hovered || focused) && !isAtMax ? 'rgba(0,0,0,0.05)' : 'transparent',
            ...(Platform.OS === 'web' && focused && { outlineStyle: 'solid', outlineWidth: 2, outlineColor: '#E63946', outlineOffset: 2 })
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Increase ${label}`}
        accessibilityHint={isAtMax ? 'Maximum value reached' : undefined}
        accessibilityState={{ disabled: isAtMax }}
        disabled={isAtMax}
        delayLongPress={300}
      >
        <IconSymbol name="plus" size={20} color={textColor} />
      </Pressable>
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
