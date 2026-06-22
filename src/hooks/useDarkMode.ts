import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('mathies-dark');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('mathies-dark', String(dark));
  }, [dark]);

  const toggle = () => setDark((d) => !d);

  return { dark, toggle };
}
