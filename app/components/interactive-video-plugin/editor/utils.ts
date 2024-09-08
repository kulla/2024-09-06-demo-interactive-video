export function getDefaultTitle(title: string, time: number): string {
  return title.trim() !== ''
    ? title
    : `Aufgabe an der Stelle ${formatTime(time)}`
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0')
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0')
  const secs = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0')

  return `${hours}:${minutes}:${secs}`
}
