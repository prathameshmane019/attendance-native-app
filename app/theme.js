// theme.js
import { DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';

export const customTheme = {
  ...PaperDefaultTheme,
  ...NavigationDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    ...NavigationDefaultTheme.colors,
    primary: '#6a11cb', // Replace with your primary color
    accent: '#6a11cb', // Replace with your accent color
    background: '#ffffff', // Replace with your background color
    surface: '#6a11cb', // Replace with your surface color
    text: '#333333', // Replace with your text color
    // Add more custom colors if needed
  },
};
