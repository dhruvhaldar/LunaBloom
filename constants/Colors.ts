/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#402c63';
const tintColorDark = '#f4e6ff';

// Set Background color of app here
// Set tint color of tabs here
export const Colors = {
  light: {
    text: '#402c63',
    background: '#fff7ff',
    tint: tintColorLight,
    icon: '#E63946',
    tabIconDefault: '#E63946',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff7ff',
    background: '#31214b',
    tint: tintColorDark,
    icon: '#1D3557',
    tabIconDefault: '#1D3557',
    tabIconSelected: tintColorDark,
  },
};
