import React, { memo, useRef, useEffect } from 'react';
import { StyleSheet, View, Pressable, Animated, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

interface SelectionButtonProps {
  label: string;
  isSelected: boolean;
  onToggle: (label: string) => void;
  type: 'checkbox' | 'radio';
  colors: {
    borderColor: string;
    selectedBackgroundColor: string;
    textColor: string;
  };
  accessibilityLabel: string;
  accessibilityHint?: string;
}

// Helper component for animating icon entry
const AnimatedIcon = ({ children }: { children: React.ReactNode }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
};

const SelectionButton = memo(function SelectionButton({
  label,
  isSelected,
  onToggle,
  type,
  colors,
  accessibilityLabel,
  accessibilityHint,
}: SelectionButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={({ pressed, hovered, focused }: any) => [
          styles.button,
          { borderColor: colors.borderColor },
          isSelected && { backgroundColor: colors.selectedBackgroundColor },
          pressed && { opacity: 0.7 },
          (hovered || focused) && !isSelected && { backgroundColor: 'rgba(0,0,0,0.05)' },
          Platform.OS === 'web' && focused && {
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineColor: colors.borderColor
          }
        ]}
        onPress={() => onToggle(label)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole={type}
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        // Force aria-checked on web if accessibilityState fails
        {...(Platform.OS === 'web' ? { 'aria-checked': isSelected } : {})}
      >
        <View style={styles.content}>
          {isSelected && (
            <AnimatedIcon>
              <IconSymbol
                name="checkmark"
                size={16}
                color={colors.textColor}
                style={styles.icon}
              />
            </AnimatedIcon>
          )}
          <ThemedText
            style={[
              { color: colors.textColor },
              isSelected && styles.selectedText,
            ]}
          >
            {label}
          </ThemedText>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 4,
  },
  selectedText: {
    fontWeight: 'bold',
  },
});

export default SelectionButton;
