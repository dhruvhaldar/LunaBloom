import { PropsWithChildren, useState } from 'react';
import { StyleSheet, Pressable, Platform } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <Pressable
        style={({ pressed, hovered, focused }: any) => [
          styles.heading,
          pressed && { opacity: 0.8 },
          (hovered || focused) && { backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' },
          Platform.OS === 'web' && focused && {
            outlineStyle: 'solid',
            outlineWidth: 2,
            outlineColor: theme === 'light' ? Colors.light.icon : Colors.dark.icon,
            outlineOffset: 2
          }
        ]}
        onPress={() => setIsOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={title}
        accessibilityHint="Double tap to toggle content"
      >
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </Pressable>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    marginVertical: -6,
    marginHorizontal: -6,
    borderRadius: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24,
  },
});
