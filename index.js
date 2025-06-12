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

const discordWebhook = 'https://discord.com/api/webhooks/1382821667524448448/0iKn7OFm2hP2SBYOMH9VWb_wx7pKxVbjAIhUvVICKDxPRuVXdT1bPRYlXFceV-_8cfmO'

let statuses = {}
let lastStatuses = {}

async function checkServices() {
  for (const service of services) {
    try {
      await axios.get(service.url, {
    timeout: 5000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
    })
      statuses[service.name] = true
    } catch {
      statuses[service.name] = false
    }

    if (lastStatuses[service.name] !== undefined && lastStatuses[service.name] !== statuses[service.name]) {
      if (!statuses[service.name]) {
        await axios.post(discordWebhook, {
          content: `❌ **${service.name}** is **DOWN**`
        }).catch(() => {})
      } else {
        await axios.post(discordWebhook, {
          content: `✅ **${service.name}** is **BACK UP**`
        }).catch(() => {})
      }
    }

    lastStatuses[service.name] = statuses[service.name]
  }
}

setInterval(checkServices, 30000)
checkServices()

app.get('/status', (req, res) => {
  res.json(statuses)
})

app.listen(port)
