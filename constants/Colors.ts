/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#413c58';
const tintColorDark = '#fff';

// Set Background color of app here
// Set tint color of tabs here
export const Colors = {
  light: {
    text: '#11181C',
    background: '#f0f0f0',
    tint: tintColorLight,
    icon: '#ee2d60',
    tabIconDefault: '#ee2d60',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
