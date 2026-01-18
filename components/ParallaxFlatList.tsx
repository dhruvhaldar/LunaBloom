import { useMemo, type ReactElement } from 'react';
import { StyleSheet, type ListRenderItem, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 150;

type Props<T> = {
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, index: number) => string;
  ListHeaderComponent?: ReactElement;
  ListEmptyComponent?: ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function ParallaxFlatList<T>({
  headerImage,
  headerBackgroundColor,
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
}: Props<T>) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.FlatList<T>>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  const parallaxHeader = useMemo(() => (
    <>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>
        {ListHeaderComponent}
      </ThemedView>
    </>
  ), [headerBackgroundColor, colorScheme, headerAnimatedStyle, headerImage, ListHeaderComponent]);

  return (
    <ThemedView style={styles.container}>
      <Animated.FlatList
        ref={scrollRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={[
           // We don't apply styles.content directly here because it has padding: 32 which might be too much if applied to the whole list including header
           // ParallaxScrollView applies it to the content wrapper.
           // We will apply paddingBottom via bottom tab overflow
           { paddingBottom: bottom },
           contentContainerStyle
        ]}
        ListHeaderComponent={parallaxHeader}
        ListFooterComponent={
            // If the list is not empty, we might want to ensure the padding/gap logic is consistent.
            // But ThemedView styles.content wraps children in ParallaxScrollView.
            // Here items are outside.
            // We should wrap items in ThemedView logic? No, FlatList renders items.
            // We can rely on the background color of the outer ThemedView.
            null
        }
        ListEmptyComponent={
            <ThemedView style={styles.content}>
                {ListEmptyComponent}
            </ThemedView>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    // Mimic ParallaxScrollView content styles for the Header component part
    paddingTop: 32,
    paddingHorizontal: 0, // Horizontal padding is handled by contentContainerStyle to apply to both header and items
    gap: 16,
    overflow: 'hidden',
  },
});
