#!/usr/bin/env node
require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
  override: true,
})

function clean(value) {
  if (!value) return undefined
  const trimmed = String(value).trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

const accountId = clean(process.env.ACCOUNT_ID)
const apiKey = clean(process.env.API_KEY ?? process.env.API_TOKEN ?? process.env.AUTH_TOKEN)
const fromNumber = clean(process.env.FREECLIMB_NUMBER)
const server = clean(process.env.API_SERVER) || "https://www.freeclimb.com/apiserver"

console.log("FreeClimb credential check\n")

if (!accountId || !apiKey || !fromNumber) {
  console.log("FAIL: Missing ACCOUNT_ID, API_KEY, or FREECLIMB_NUMBER in .env")
  process.exit(1)
}

if (apiKey.startsWith("vault:")) {
  console.log(
    "FAIL: API_KEY looks like a dashboard placeholder (vault:...). Reveal and copy the actual API key from Account → API Credentials.",
  )
  process.exit(1)
}

if (!accountId.startsWith("AC")) {
  console.log("FAIL: ACCOUNT_ID should start with AC")
  process.exit(1)
}

console.log("ACCOUNT_ID:", accountId.slice(0, 6) + "..." + accountId.slice(-4))
console.log("API_KEY length:", apiKey.length)
console.log("FREECLIMB_NUMBER:", fromNumber)
console.log("API_SERVER:", server)
console.log("")

const auth = Buffer.from(`${accountId}:${apiKey}`).toString("base64")
const url = `${server}/Accounts/${encodeURIComponent(accountId)}/Applications`

fetch(url, {
  headers: { Authorization: `Basic ${auth}`, Accept: "application/json" },
})
  .then(async (response) => {
    const text = await response.text()
    let body = null
    try {
      body = JSON.parse(text)
    } catch {
      body = { message: text }
    }

    if (response.ok) {
      console.log("PASS: FreeClimb accepted your credentials.")
      process.exit(0)
    }

    console.log("FAIL:", body.message || `HTTP ${response.status}`)
    if (body.code === 50) {
      console.log(
        "Hint: Regenerate your API key in the FreeClimb dashboard, paste it into .env as API_KEY, and restart the dev server.",
      )
    }
    process.exit(1)
  })
  .catch((error) => {
    console.log("FAIL: Could not reach FreeClimb:", error.message)
    process.exit(1)
  })
