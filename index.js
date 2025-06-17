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
  { name: 'X (Twitter)', url: 'https://twitter.com' },
  { name: 'DMenu GT', url: 'https://www.dmenu.me/Download/DMenuAutoUpdate.dll' },
  { name: 'DMenu CS', url: 'https://cs.dmenu.me' }
]

const webhookId = '1382821667524448448'
const webhookToken = '0iKn7OFm2hP2SBYOMH9VWb_wx7pKxVbjAIhUvVICKDxPRuVXdT1bPRYlXFceV-_8cfmO'
const webhookBaseUrl = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`
const messageId = '1383036608558923837'

let statuses = {}
let lastStatuses = {}

async function updateDiscordEmbed() {
  const maxFields = 25
  const embeds = []
  let current = []

  for (const [name, up] of Object.entries(statuses)) {
    current.push({ name, value: up ? '✅ UP' : '❌ DOWN', inline: true })
    if (current.length === maxFields) {
      embeds.push({
        title: '📡 Service Status Monitor',
        color: Object.values(statuses).some(v => !v) ? 0xED4245 : 0x57F287,
        timestamp: new Date().toISOString(),
        fields: current
      })
      current = []
    }
  }
  if (current.length > 0) {
    embeds.push({
      title: '📡 Service Status Monitor',
      color: Object.values(statuses).some(v => !v) ? 0xED4245 : 0x57F287,
      timestamp: new Date().toISOString(),
      fields: current
    })
  }

  await axios.patch(`${webhookBaseUrl}/messages/${messageId}`, { embeds }).catch(err => {
    console.error('[UPDATE FAIL]', err.response?.data || err.message)
  })
}

async function checkServices() {
  for (const service of services) {
    try {
      await axios.get(service.url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
        validateStatus: s => s < 500
      })
      statuses[service.name] = true
    } catch {
      statuses[service.name] = false
    }

    if (
      lastStatuses[service.name] !== undefined &&
      lastStatuses[service.name] !== statuses[service.name]
    ) {
      const text = statuses[service.name]
        ? `✅ **${service.name}** is **BACK UP**`
        : `❌ **${service.name}** is **DOWN**`

      await axios.post(webhookBaseUrl, { content: text }).catch(() => {})
    }

    lastStatuses[service.name] = statuses[service.name]
  }

  await updateDiscordEmbed()
}

setInterval(checkServices, 30000)
checkServices()

app.get('/status', (req, res) => {
  res.json(statuses)
})

app.listen(port, () => {
  console.log(`Service Monitor running on http://localhost:${port}`)
})