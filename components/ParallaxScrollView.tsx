import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, FlatListProps } from 'react-native';
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

type Props<T = any> = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  flatListProps?: FlatListProps<T>;
}>;

export default function ParallaxScrollView<T>({
  children,
  headerImage,
  headerBackgroundColor,
  flatListProps,
}: Props<T>) {
  const colorScheme = useColorScheme() ?? 'light';
  // Use generic generic ref that works for both ScrollView and FlatList for useScrollViewOffset
  const scrollRef = useAnimatedRef<any>();
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

  const headerElement = (
    <>
      <Animated.View
        style={[
          styles.header,
          { backgroundColor: headerBackgroundColor[colorScheme] },
          headerAnimatedStyle,
        ]}>
        {headerImage}
      </Animated.View>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </>
  );

  return (
    <ThemedView style={styles.container}>
      {flatListProps ? (
        <Animated.FlatList
          ref={scrollRef}
          scrollEventThrottle={16}
          scrollIndicatorInsets={{ bottom }}
          ListHeaderComponent={headerElement}
          {...flatListProps}
          contentContainerStyle={[
             // Ensure safe area padding is applied, but allow overrides
             { paddingBottom: bottom },
             flatListProps.contentContainerStyle
          ]}
        />
      ) : (
        <Animated.ScrollView
          ref={scrollRef}
          scrollEventThrottle={16}
          scrollIndicatorInsets={{ bottom }}
          contentContainerStyle={{ paddingBottom: bottom }}>
          {headerElement}
        </Animated.ScrollView>
      )}
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
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
