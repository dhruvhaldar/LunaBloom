import { Tabs } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, Animated, View, Image } from 'react-native';

import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Custom tab button component with animation
// Optimization: Moved outside component to prevent re-definition on every render
const AnimatedTabButton = ({ children, onPress, accessibilityLabel }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      bounciness: 10,
      speed: 80,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 80,
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

// Reusable Tab Icon Component
// Optimization: Extracted to prevent inline function recreation and allow stable referencing
const TabIcon = ({ color, focused, name, size = 29 }: { color: string, focused: boolean, name: React.ComponentProps<typeof IconSymbol>['name'], size?: number }) => (
  <View style={styles.tabItemContainer}>
    <IconSymbol
      size={size}
      name={name}
      color={color}
      style={{
        opacity: focused ? 1 : 0.8
      }}
    />
  </View>
);

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
            <TabIcon color={color} focused={focused} name="house.fill" size={tabBarButtonSize} />
          ),
        }}
      />

       {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="history.fill" size={tabBarButtonSize} />
          ),
        }}
      />
      
      {/* Cycle Insights Tab */}
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={color} focused={focused} name="bar-chart.fill" size={tabBarButtonSize} />
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
            <TabIcon color={color} focused={focused} name="settings.fill" size={tabBarButtonSize} />
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
