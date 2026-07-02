// Argentina is always UTC-3 (no DST). Manual formatting avoids browser locale inconsistencies.
function toArgentina(date: Date): Date {
  return new Date(date.getTime() - 3 * 60 * 60 * 1000)
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// "02/07/2026 21:00"
export function formatDateTime(value: string | number | Date): string {
  const d = toArgentina(new Date(value))
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

// "02/07 21:00"
export function formatDateTimeShort(value: string | number | Date): string {
  const d = toArgentina(new Date(value))
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}
