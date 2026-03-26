import { Link, Stack } from 'expo-router';
import { StyleSheet, Pressable, Platform } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#E63946' : '#1D3557';

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <IconSymbol
          name="exclamationmark.triangle.fill"
          size={80}
          color={iconColor}
          style={styles.icon}
        />

        <ThemedText type="title" style={styles.title}>
          Page Not Found
        </ThemedText>

        <ThemedText style={styles.message}>
          We couldn't find the screen you're looking for. It might have been moved or deleted.
        </ThemedText>

        <Link href="/" asChild>
          <Pressable
            style={({ pressed, hovered, focused }: any) => [
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
            accessibilityRole="button"
            accessibilityLabel="Go to home screen"
          >
            <ThemedText style={styles.buttonText}>
              Go Home 🏠
            </ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.9,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    fontSize: 16,
    opacity: 0.8,
    maxWidth: 300,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#457B9D',
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
    fontSize: 16,
    fontWeight: 'bold',
  },
});
