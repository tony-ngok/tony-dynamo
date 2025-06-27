export function emailValidate(email) {
  const re = /\S+@\S+\.\S+/
  return re.test(email)
}
