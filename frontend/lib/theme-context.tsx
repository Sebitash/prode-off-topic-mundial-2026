'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { API_URL } from './config'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

function readStoredTheme(): Theme {
  const stored = localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored

  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      const u = JSON.parse(storedUser)
      if (u.theme === 'light' || u.theme === 'dark') return u.theme
    } catch {
      // ignore
    }
  }

  return 'light'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const initial = readStoredTheme()
    setTheme(initial)
    applyTheme(initial)

    // La DB es la fuente de verdad: si el usuario cambió el tema en otro
    // dispositivo, lo sincronizamos acá para no quedarnos con el valor
    // viejo guardado en este navegador.
    const token = localStorage.getItem('token')
    if (token) {
      fetch(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const serverTheme = data?.user?.theme
          if (serverTheme === 'light' || serverTheme === 'dark') {
            setTheme(serverTheme)
            applyTheme(serverTheme)
            localStorage.setItem('theme', serverTheme)

            const storedUser = localStorage.getItem('user')
            if (storedUser) {
              try {
                const u = JSON.parse(storedUser)
                localStorage.setItem('user', JSON.stringify({ ...u, theme: serverTheme }))
              } catch {
                // ignore
              }
            }
          }
        })
        .catch(() => {})
    }
  }, [])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      localStorage.setItem('theme', next)

      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser)
          localStorage.setItem('user', JSON.stringify({ ...u, theme: next }))
        } catch {
          // ignore
        }
      }

      const token = localStorage.getItem('token')
      if (token) {
        fetch(`${API_URL}/api/user/theme`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: next }),
        }).catch(() => {})
      }

      return next
    })
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
