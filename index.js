const express = require('express')
const axios = require('axios')
const app = express()
const port = 3000

app.use(express.static('public'))

const services = [
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'Discord', url: 'https://discord.com' },
  { name: 'Spotify', url: 'https://spotify.com' },
  { name: 'NPM', url: 'https://registry.npmjs.org' },
  { name: 'AWS', url: 'https://aws.amazon.com' },
  { name: 'Roblox', url: 'https://www.roblox.com' },
  { name: 'OpenAI', url: 'https://openai.com' },
  { name: 'Steam', url: 'https://store.steampowered.com' },
  { name: 'Reddit', url: 'https://www.reddit.com' },
  { name: 'Twitch', url: 'https://www.twitch.tv' },
  { name: 'ExitLag', url: 'https://www.exitlag.com' },
  { name: 'Epic Games', url: 'https://www.epicgames.com' },
  { name: 'Netflix', url: 'https://www.netflix.com' },
  { name: 'X (Twitter)', url: 'https://twitter.com' }
]

const webhookId = '1382821608699330771'
const messageId = '1382822541583716435'
const webhookToken = '0iKn7OFm2hP2SBYOMH9VWb_wx7pKxVbjAIhUvVICKDxPRuVXdT1bPRYlXFceV-_8cfmO'

let statuses = {}
let lastStatuses = {}

async function checkServices() {
  for (const service of services) {
    try {
      await axios.get(service.url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        validateStatus: status => status < 500
      })
      statuses[service.name] = true
    } catch {
      statuses[service.name] = false
    }

    lastStatuses[service.name] = statuses[service.name]
  }

  updateDiscordEmbed()
}

async function updateDiscordEmbed() {
  const fields = Object.entries(statuses).map(([name, up]) => ({
    name,
    value: up ? '✅ UP' : '❌ DOWN',
    inline: true
  }))

  const embed = {
    title: '📡 Service Status Monitor',
    color: statusesHasDown() ? 0xED4245 : 0x57F287,
    timestamp: new Date().toISOString(),
    fields
  }

  const url = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}/messages/${messageId}`

  await axios.patch(url, { embeds: [embed] }, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).catch(err => {
    console.error('[embed update fail]', err.response?.data || err.message)
  })
}

function statusesHasDown() {
  return Object.values(statuses).some(v => !v)
}

setInterval(checkServices, 30000)
checkServices()

app.get('/status', (req, res) => {
  res.json(statuses)
})

app.listen(port)
