import * as cheerio from "cheerio"

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

export function htmlText(htmlString) {
  const $ = cheerio.load(htmlString)
  const textContent = $("body").text().trim()
  return textContent || ""
}
