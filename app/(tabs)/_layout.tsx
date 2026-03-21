import { Tabs } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, Pressable, Platform, ViewStyle, Animated, View } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import { Image } from 'react-native';

// Custom tab button component with animation
// Optimization: Moved outside TabLayout to prevent re-creation on every render
const AnimatedTabButton = (props: any) => {
  const { children, onPressIn, onPressOut, ...rest } = props;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      bounciness: 10,
      speed: 80,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 80,
      speed: 0.4,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed, hovered, focused }: any) => [
        rest.style,
        styles.tabButtonContainer,
        { opacity: pressed ? 0.7 : 1 },
        Platform.select({
          web: {
            outlineStyle: focused ? 'solid' : 'none',
            outlineWidth: 2,
            outlineColor: '#E63946',
            outlineOffset: 2,
          } as any,
        }),
      ]}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Animated.View style={{
        transform: [{ scale: scaleAnim }],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </Animated.View>
    </Pressable>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const tabBarButtonSize = 29;

  const tabBarStyle: ViewStyle = {
    position: 'absolute',
    bottom: 10,
    borderRadius: 48,
    height: 70,
    alignContent: 'center',
    backgroundColor: colorScheme === 'dark' 
      ? '#1D3557' 
      : '#F1FAEE',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: borderColor,
    overflow: 'hidden',
    paddingHorizontal: 0,
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
        tabBarShowLabel: true,
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>

      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <IconSymbol 
                size={tabBarButtonSize} 
                name="house.fill" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.8 
                }} 
              />
            </View>
          ),
        }}
      />

       {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <IconSymbol 
                size={tabBarButtonSize} 
                name="history.fill" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.8 
                }} 
              />
            </View>
          ),
        }}
      />
      
      {/* Cycle Insights Tab */}
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <IconSymbol 
                size={tabBarButtonSize} 
                name="bar-chart.fill" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.8 
                }} 
              />
            </View>
          ),
        }}
      />

      {/* MenstruAI Tab */}
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'MenstruAI',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <Image source={require('@/assets/images/ai.png')} style={styles.tinyLogo}/>
            </View>
          ),
        }}
      />
      
    {/* Settings Tab */}
    <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              <IconSymbol 
                size={tabBarButtonSize} 
                name="settings.fill" 
                color={color}
                style={{ 
                  opacity: focused ? 1 : 0.8 
                }} 
              />
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
  tinyLogo: {
    width: 40,
    height: 40,
  },
});
