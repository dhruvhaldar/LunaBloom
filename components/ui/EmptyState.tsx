import React, { useEffect, useRef } from 'react';
import { StyleSheet, Pressable, ViewStyle, Animated, Easing, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: IconSymbolName;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ title, message, icon, actionLabel, onAction, style }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#457B9D' : '#A8DADC'; // Muted brand color
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loopAnimation: Animated.CompositeAnimation | null = null;
    const entryAnimation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]);

    entryAnimation.start(({ finished }) => {
      if (finished) {
        // Start floating animation after entry
        loopAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnim, {
              toValue: -10,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(floatAnim, {
              toValue: 0,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        loopAnimation.start();
      }
    });

    return () => {
      entryAnimation.stop();
      loopAnimation?.stop();
    };
  }, [fadeAnim, scaleAnim, slideAnim, floatAnim]);

  return (
    <ThemedView
      style={[styles.container, style]}
      testID="empty-state-container"
      accessibilityLiveRegion="polite"
    >
      {icon && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: floatAnim }
            ]
          }}
          accessible={false}
          importantForAccessibility="no"
          testID="empty-state-icon-container"
        >
          <IconSymbol
            name={icon}
            size={80}
            color={iconColor}
            style={styles.icon}
          />
        </Animated.View>
      )}
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.message, { color: textColor }]}>
          {message}
        </ThemedText>
        {actionLabel && onAction && (
          <Pressable
            style={({ pressed, hovered, focused }: { pressed: boolean; hovered?: boolean; focused?: boolean }) => [
              styles.button,
              pressed && { opacity: 0.7 },
              (hovered || focused) && { backgroundColor: '#c5303c' },
              Platform.OS === 'web' && focused && {
                outlineStyle: 'solid',
                outlineWidth: 2,
                outlineColor: '#E63946',
                outlineOffset: 2,
              }
            ]}
            onPress={onAction}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <ThemedText style={styles.buttonText}>{actionLabel}</ThemedText>
          </Pressable>
        )}
      </Animated.View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
