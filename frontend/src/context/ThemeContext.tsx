import { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

// Light: 6 AM – 7 PM  |  Dark: 7 PM – 6 AM
function getThemeForHour(): Theme {
  const h = new Date().getHours();
  return h >= 6 && h < 19 ? 'light' : 'dark';
}

export const CHART_COLORS: Record<Theme, {
  bg: string; text: string; grid: string;
  line: string; topColor: string; bottomColor: string;
  crosshair: string; crosshairBg: string; priceLine: string;
  lineInvested: string;
}> = {
  dark: {
    bg:           '#0d0b0a',
    text:         '#b5a898',
    grid:         '#2e2620',
    line:         '#D4A017',
    topColor:     'rgba(212,160,23,0.22)',
    bottomColor:  'rgba(212,160,23,0)',
    crosshair:    '#D4A017',
    crosshairBg:  '#1d1916',
    priceLine:    'rgba(212,160,23,0.5)',
    lineInvested: '#5c5040',
  },
  light: {
    bg:           '#ffffff',
    text:         '#5c4a38',
    grid:         '#e2d8cc',
    line:         '#C8102E',
    topColor:     'rgba(200,16,46,0.1)',
    bottomColor:  'rgba(200,16,46,0)',
    crosshair:    '#C8102E',
    crosshairBg:  '#faf8f4',
    priceLine:    'rgba(200,16,46,0.4)',
    lineInvested: '#cfc2b2',
  },
};

interface ThemeContextType { theme: Theme; }
const ThemeContext = createContext<ThemeContextType>({ theme: 'dark' });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getThemeForHour);

  // Re-check every 60 s so the switch happens close to the hour boundary
  useEffect(() => {
    const id = setInterval(() => setTheme(getThemeForHour()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Apply to <html data-theme="…">  — CSS vars do the rest
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
