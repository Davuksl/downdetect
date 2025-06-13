const express = require('express')
const axios = require('axios')
const fs = require('fs')
const dns = require('dns').promises
const ping = require('ping')
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

async function getServiceInfo(service) {
  const url = new URL(service.url)
  const hostname = url.hostname
  try {
    const [ip] = await dns.resolve4(hostname)
    const pingRes = await ping.promise.probe(hostname, { timeout: 2 })
    return {
      ip,
      ping: pingRes.time,
      alive: pingRes.alive
    }
  } catch {
    return {
      ip: 'N/A',
      ping: 'N/A',
      alive: false
    }
  }
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
    }).catch(() => null)

    if (res?.data?.id) {
      messageId = res.data.id
      fs.writeFileSync('message_id.txt', messageId)
    }
  } else {
    await axios.patch(`${webhookBaseUrl}/messages/${messageId}`, {
      embeds: [embed]
    }).catch(() => {})
  }
}

app.get('/status', (req, res) => {
  res.json(statuses)
})

app.get('/info/:name', async (req, res) => {
  const service = services.find(s => s.name === req.params.name)
  if (!service) return res.status(404).json({ error: 'Not found' })

  const info = await getServiceInfo(service)
  res.json({
    name: service.name,
    url: service.url,
    ip: info.ip,
    ping: info.ping,
    alive: info.alive
  })
})

setInterval(checkServices, 30000)
checkServices()

app.listen(port)
