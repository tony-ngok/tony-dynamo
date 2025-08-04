import * as cheerio from "cheerio"

export function apiString(input) {
  if (!input) return ""
  if (typeof input !== 'string') return ""
  return input.trim()
}

export function apiNatNum(input) {
  if (!input) return 1
  const output = parseInt(input) || 1
  return output > 0 ? output : 1
}

export function getId(key) {
  return key.split("#")[1]
}

export function toLocaleDateTime(timestamp) {
  const date = new Date(timestamp)

  const yyyy = date.getFullYear()
  const mm = (date.getMonth() + 1).toString().padStart(2, '0')
  const dd = date.getDate().toString().padStart(2, '0')
  const hh = date.getHours().toString().padStart(2, '0')
  const mi = date.getMinutes().toString().padStart(2, '0')
  const ss = date.getSeconds().toString().padStart(2, '0')

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

export function htmlText(htmlString) {
  const $ = cheerio.load(htmlString)
  const textContent = $("body").text().trim()
  return textContent || ""
}
