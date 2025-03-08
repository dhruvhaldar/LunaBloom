import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const borderColor = colorScheme === 'dark' ? '#ee2d60' : '#ee2d60';

  const tabBarStyle: ViewStyle = {
    position: 'absolute',
    bottom: 10, // control vertical positioning
    borderRadius: 48,
    height: 60,
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

  // Custom tab button component to increase touchable area
  const CustomTabButton = ({ children, onPress, accessibilityLabel }) => (
    <TouchableOpacity 
      style={styles.tabButtonContainer}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 0, bottom: 0, left: 40, right: 40 }} // Increase touch area
    >
      {children}
    </TouchableOpacity>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: (props) => <CustomTabButton {...props} />,
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="house.fill" 
              color={color}
              style={{ 
                opacity: focused ? 1 : 0.6 
              }} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={28} 
              name="history.fill" 
              color={color}
              style={{ 
                opacity: focused ? 1 : 0.6 
              }} 
            />
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
    paddingVertical: 10, // Increase vertical padding
    paddingHorizontal: 20, // Increase horizontal padding
  },
  tabItemContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
  },
});