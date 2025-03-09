import { Tabs } from 'expo-router';
import React, { useRef } from 'react';
import { Platform, StyleSheet, TouchableOpacity, ViewStyle, Animated, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedText } from '@/components/ThemedText';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#ee2d60' : '#ee2d60';

  const tabBarStyle: ViewStyle = {
    position: 'absolute',
    bottom: 10,
    borderRadius: 48,
    height: 70,
    alignContent:'center',
    backgroundColor: colorScheme === 'dark' 
      ? 'rgba(30, 30, 30, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: borderColor,
    elevation: 2, 
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    paddingHorizontal: 0,
  };

  // Custom tab button component with animation
  const AnimatedTabButton = ({ children, onPress, accessibilityLabel }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.5,
        useNativeDriver: true,
        bounciness: 30,
        speed: 0.4,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
        speed: 0.4,
      }).start();
    };

    return (
      <TouchableOpacity 
        style={styles.tabButtonContainer}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      >
        <Animated.View style={{ 
          transform: [{ scale: scaleAnim }],
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: (props) => <AnimatedTabButton {...props} />,
        tabBarBackground: TabBarBackground,
        tabBarStyle: tabBarStyle,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <IconSymbol 
                size={28} 
                name="house.fill" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.6 
                }} 
              />
              {focused && (
                <ThemedText style={[styles.tabLabel, { color }]}>
                  Home
                </ThemedText>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <IconSymbol 
                size={28} 
                name="history.fill" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.6 
                }} 
              />
              {focused && (
                <ThemedText style={[styles.tabLabel, { color }]}>
                  History
                </ThemedText>
              )}
            </View>
          ),
        }}
      />
      {/* New Insights Tab */}
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <IconSymbol 
                size={28} 
                name="bar-chart.fill" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.6 
                }} 
              />
              {focused && (
                <ThemedText style={[styles.tabLabel, { color }]}>
                  Insights
                </ThemedText>
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 8,
    marginTop: 0,
  },
});