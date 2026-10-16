import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'rahul-os:theme'

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  // The inline script in index.html has already resolved stored/system choice.
  const applied = document.documentElement.dataset.theme
  if (applied === 'light' || applied === 'dark') return applied
  return 'dark'
}

/**
 * Theme control. Dark is the default; the visitor's choice is remembered, and
 * a first visit follows the operating system preference (handled before paint
 * by the inline script in index.html).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable (private mode) — session-only theme */
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, setTheme, toggleTheme }
}
