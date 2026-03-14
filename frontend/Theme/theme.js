import React, { createContext, useContext, useState, useCallback } from 'react';

// ─── Dark Hardware Store Theme ───
export const darkColors = {
    background: '#1a1a2e',
    surface: '#16213e',
    surfaceLight: '#1f3460',
    primary: '#ff6600',
    primaryDark: '#cc5200',
    secondary: '#00b4d8',
    accent: '#ffd60a',
    text: '#e8e8e8',
    textSecondary: '#a0a0b0',
    textOnPrimary: '#ffffff',
    danger: '#e74c3c',
    success: '#2ecc71',
    warning: '#f39c12',
    border: '#2a2a4a',
    inputBg: '#1f2b47',
    cardBg: '#16213e',
    headerBg: '#0f1626',
    tabBarBg: '#0f1626',
    overlay: 'rgba(0,0,0,0.7)',
};

// ─── Light Hardware Store Theme ───
export const lightColors = {
    background: '#f5f5f5',
    surface: '#ffffff',
    surfaceLight: '#e8ecf1',
    primary: '#ff6600',
    primaryDark: '#cc5200',
    secondary: '#0088a8',
    accent: '#d4a000',
    text: '#1a1a2e',
    textSecondary: '#5a5a6e',
    textOnPrimary: '#ffffff',
    danger: '#e74c3c',
    success: '#2ecc71',
    warning: '#f39c12',
    border: '#d0d0e0',
    inputBg: '#eef1f6',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    tabBarBg: '#ffffff',
    overlay: 'rgba(0,0,0,0.4)',
};

const ThemeContext = createContext(darkColors);
const ThemeToggleContext = createContext(() => {});
const ThemeModeContext = createContext('dark');

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(true);
    const colors = isDark ? darkColors : lightColors;
    const toggleTheme = useCallback(() => setIsDark(prev => !prev), []);

    return (
        <ThemeModeContext.Provider value={isDark ? 'dark' : 'light'}>
            <ThemeToggleContext.Provider value={toggleTheme}>
                <ThemeContext.Provider value={colors}>
                    {children}
                </ThemeContext.Provider>
            </ThemeToggleContext.Provider>
        </ThemeModeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
export const useToggleTheme = () => useContext(ThemeToggleContext);
export const useThemeMode = () => useContext(ThemeModeContext);

export default darkColors;
