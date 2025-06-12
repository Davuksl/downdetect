const express = require('express')
const axios = require('axios')
const fs = require('fs')
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

const webhookId = '1382821667524448448'
const webhookToken = '0iKn7OFm2hP2SBYOMH9VWb_wx7pKxVbjAIhUvVICKDxPRuVXdT1bPRYlXFceV-_8cfmO'
const webhookBaseUrl = `https://discord.com/api/webhooks/${webhookId}/${webhookToken}`

let statuses = {}
let lastStatuses = {}
let messageId = null

if (fs.existsSync('message_id.txt')) {
  messageId = fs.readFileSync('message_id.txt', 'utf-8')
}

async function checkServices() {
  for (const service of services) {
    try {
      await axios.get(service.url, {
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        },
        validateStatus: status => status < 500
      })
      statuses[service.name] = true
    } catch {
      statuses[service.name] = false
    }
  }

  await updateDiscordEmbed()
}

async function updateDiscordEmbed() {
  const fields = Object.entries(statuses).map(([name, up]) => ({
    name,
    value: up ? '✅ UP' : '❌ DOWN',
    inline: true
  }))

  const embed = {
    title: '📡 Service Status Monitor',
    color: Object.values(statuses).some(v => !v) ? 0xED4245 : 0x57F287,
    timestamp: new Date().toISOString(),
    fields
  }

  if (!messageId) {
    const res = await axios.post(webhookBaseUrl, {
      content: '**Service status monitor started**',
      embeds: [embed]
    })
    messageId = res.data.id
    fs.writeFileSync('message_id.txt', messageId)
  } else {
    await axios.patch(`${webhookBaseUrl}/messages/${messageId}`, {
      embeds: [embed]
    }).catch(err => {
      console.error('[UPDATE FAIL]', err.response?.data || err.message)
    })
  }
}

setInterval(checkServices, 30000)
checkServices()

app.get('/status', (req, res) => {
  res.json(statuses)
})

app.listen(port)
