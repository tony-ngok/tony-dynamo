export function emailValidate(email) {
  const re = /\S+@\S+\.\S+/
  return re.test(email)
}

export function apiString(input) {
  if (!input) return ""
  if (typeof input !== 'string') return ""
  return input.trim()
}
