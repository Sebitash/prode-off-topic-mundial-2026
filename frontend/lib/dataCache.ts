// Cache simple en memoria compartido entre páginas (vive mientras dure la SPA).
// Permite mostrar datos al instante al navegar entre secciones mientras se
// refrescan en segundo plano (stale-while-revalidate).

const cache = new Map<string, unknown>()

export function getCache<T>(key: string): T | undefined {
  return cache.get(key) as T | undefined
}

export function setCache<T>(key: string, value: T) {
  cache.set(key, value)
}
