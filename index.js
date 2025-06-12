const express = require('express')
const puppeteer = require('puppeteer')
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
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()

  for (const service of services) {
    try {
      const res = await page.goto(service.url, { timeout: 10000, waitUntil: 'domcontentloaded' })
      const statusCode = res.status()
      statuses[service.name] = statusCode < 400
    } catch {
      statuses[service.name] = false
    }

    if (lastStatuses[service.name] !== undefined && lastStatuses[service.name] !== statuses[service.name]) {
      if (!statuses[service.name]) {
        await fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `❌ **${service.name}** is **DOWN**` })
        }).catch(() => {})
      } else {
        await fetch(discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `✅ **${service.name}** is **BACK UP**` })
        }).catch(() => {})
      }
    }

    lastStatuses[service.name] = statuses[service.name]
  }

  await browser.close()
}

setInterval(checkServices, 30000)
checkServices()

app.get('/status', (req, res) => {
  res.json(statuses)
})

app.listen(port)