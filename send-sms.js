require("./load-env")
const freeclimbSDK = require('@freeclimb/sdk')

const accountId = process.env.ACCOUNT_ID
const apiKey = process.env.API_KEY
const fromNumber = process.env.FREECLIMB_NUMBER
const baseServer = new freeclimbSDK.ServerConfiguration(process.env.API_SERVER || 'https://www.freeclimb.com/apiserver')

if (!accountId || !apiKey || !fromNumber) {
  console.error('Missing environment variables. Set ACCOUNT_ID, API_KEY, and FREECLIMB_NUMBER in .env')
  process.exit(1)
}

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node send-sms.js <to> <message>')
  console.error('Example: node send-sms.js +15551234567 "Hello from FreeClimb!"')
  process.exit(1)
}

const to = args[0]
const text = args.slice(1).join(' ')

const config = freeclimbSDK.createConfiguration({ baseServer, accountId, apiKey })
const api = new freeclimbSDK.DefaultApi(config)

const messageRequest = {
  _from: fromNumber,
  to,
  text,
}

console.log('Sending SMS with request:', JSON.stringify(messageRequest, null, 2))

api.sendAnSmsMessage(messageRequest)
  .then(response => {
    console.log('SMS sent successfully!')
    console.log(JSON.stringify(response, null, 2))
  })
  .catch(error => {
    console.error('Failed to send SMS:', error.message || error)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Body:', JSON.stringify(error.response.data, null, 2))
    }
    process.exit(1)
  })
