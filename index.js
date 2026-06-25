require("./load-env")
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
const freeclimbSDK = require('@freeclimb/sdk')

const port = process.env.PORT || 3000

function getCredentials() {
  require("./load-env").loadEnv()
  return {
    accountId: process.env.ACCOUNT_ID,
    apiKey: process.env.API_KEY,
    fromNumber: process.env.FREECLIMB_NUMBER,
  }
}

function getApiInstance() {
  const { accountId, apiKey } = getCredentials()
  const baseServer = new freeclimbSDK.ServerConfiguration(process.env.API_SERVER || "https://www.freeclimb.com/apiserver")
  const freeclimbConfig = freeclimbSDK.createConfiguration({ baseServer, accountId, apiKey })
  return new freeclimbSDK.DefaultApi(freeclimbConfig)
}

app.post('/incomingSms', (req, res) => {
  const { fromNumber } = getCredentials()
  console.log('POST /incomingSms - raw body:', req.body)
  const { from: userPhoneNumber, to: freeclimbNumber, text: incomingText } = req.body || {}
  console.log('POST /incomingSms - parsed from:', userPhoneNumber, 'to:', freeclimbNumber, 'text:', incomingText)
  console.log('POST /incomingSms - configured FREECLIMB_NUMBER:', fromNumber)

  const messageRequest = {
    _from: fromNumber,
    to: userPhoneNumber,
    text: 'Hello, World!'
  }

  console.log('POST /incomingSms - sending reply with request:', messageRequest)
  getApiInstance().sendAnSmsMessage(messageRequest)
    .then(response => {
      console.log('POST /incomingSms - reply sent, response:', response)
      res.sendStatus(200);
    })
    .catch(err => {
      console.error('POST /incomingSms - error sending reply:', err)
      if (err && err.body) console.error('POST /incomingSms - API error body:', err.body)
      // return error details for debugging
      res.status(500).json({ error: err.message || 'Failed to send reply', details: err.body || err })
    })
})

// Outgoing SMS endpoint
app.post('/send', (req, res) => {
  const { to, text } = req.body
  const { fromNumber } = getCredentials()

  console.log('POST /send body:', req.body)
  console.log('POST /send configured FREECLIMB_NUMBER:', fromNumber)

  if (!to || !text) {
    return res.status(400).json({ error: 'Missing to or text in request body' })
  }
  
  const messageRequest = {
    _from: fromNumber,
    to,
    text
  }

  console.log('Outgoing SMS request:', JSON.stringify(messageRequest, null, 2))

  getApiInstance().sendAnSmsMessage(messageRequest)
    .then(() => {
      res.json({ success: true, to, text })
    })
    .catch(err => {
      console.error('Outgoing SMS failed:', err)
      let details = null
      if (typeof err?.body === 'string') {
        try {
          details = JSON.parse(err.body)
        } catch {
          details = err.body
        }
      } else if (err?.body) {
        details = err.body
      }

      const message = details?.message || err.message || 'Failed to send SMS'
      const hint = details?.code === 50
        ? 'Check ACCOUNT_ID and API_KEY in .env — regenerate your API key in the FreeClimb dashboard if needed.'
        : undefined

      res.status(details?.code === 50 ? 401 : 500).json({ error: message, details, hint })
    })
})

// Specify this route with 'Status Callback URL' in App Config
app.post('/status', (req, res) => {
  // handle status changes
  res.status(200)
})

// Liveness probe endpoint
app.get("/live", (req, res) => {
  res.status(200).json({ status: "live" });
});

// Readiness probe endpoint
app.get("/ready", (req, res) => {
  res.status(200).json({ status: "ready" });
});

app.listen(port, () => {
  const localUrl = `http://127.0.0.1:${port}`
  const { accountId, apiKey, fromNumber } = getCredentials()
  console.log(`\nWelcome to FreeClimb!\n`);
  if (!accountId || !apiKey || !fromNumber) {
    console.log("ERROR: ENVIRONMENT VARIABLES ARE NOT SET. PLEASE SET ALL ENVIRONMMENT VARIABLES AND RETRY.");
    console.log(
      "Refer to https://www.npmjs.com/package/dotenv for further instructions.\n"
    );
    process.exit()
  } else {
    const obfuscatedApiKey = apiKey.replace(/.(?=.{4,}$)/g, '*')
    console.log(`Your account id: ${accountId}`);
    console.log(`Your api key is: ${obfuscatedApiKey}`);
    console.log(`Your FreeClimb number: ${fromNumber}\n`);
  }

  console.log(`Your web server is listening at: ${localUrl}`);
  console.log(
    `Your NEXT STEP is to use NGROK to proxy HTTP Traffic to this local web server.`
  );
  console.log(
    `  1. In NGROK, configure the dynamic url generate to proxy to ${localUrl}`
  );
  console.log(
    `  2. In the Dashboard or API, set your FreeClimb Application Voice Url to the dynamic NGROK endpoint generated.`
  );
  console.log(`\nListening on port: ${port}`);
});
