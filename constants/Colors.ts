/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#413c58';
const tintColorDark = '#f0f0f0';

// Set Background color of app here
// Set tint color of tabs here
export const Colors = {
  light: {
    text: '#1D3557',
    background: '#F1FAEE',
    tint: tintColorLight,
    icon: '#E63946',
    tabIconDefault: '#E63946',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#1D3557',
    tint: tintColorDark,
    icon: '#1D3557',
    tabIconDefault: '#1D3557',
    tabIconSelected: tintColorDark,
  },
};
