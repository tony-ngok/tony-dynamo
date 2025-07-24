export function apiString(input) {
  if (!input) return ""
  if (typeof input !== 'string') return ""
  return input.trim()
}

export function getId(key) {
  return key.split("#")[1]
}

export function toLocaleDateTime(timestamp) {
  const dateObj = new Date(timestamp)
  return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`
}
