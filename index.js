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
  { name: 'OpenAI', url: 'https://openai.com' }
]

let statuses = {}

async function checkServices() {
  for (const service of services) {
    try {
      await axios.get(service.url, { timeout: 5000 })
      statuses[service.name] = true
    } catch {
      statuses[service.name] = false
    }
  }
}

setInterval(checkServices, 30000)
checkServices()

app.get('/status', (req, res) => {
  res.json(statuses)
})

app.listen(port)
