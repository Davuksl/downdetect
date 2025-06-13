async function loadStatuses() {
  const res = await fetch('/status')
  const statuses = await res.json()

  const container = document.getElementById('services')
  container.innerHTML = ''

  for (const [name, up] of Object.entries(statuses)) {
    const div = document.createElement('div')
    div.className = 'service ' + (up ? 'up' : 'down')
    div.textContent = name
    div.onclick = () => showInfo(name)
    container.appendChild(div)
  }
}

async function showInfo(name) {
  const res = await fetch('/info/' + encodeURIComponent(name))
  const data = await res.json()

  document.getElementById('modal-title').textContent = data.name
  document.getElementById('url').textContent = data.url
  document.getElementById('ip').textContent = data.ip
  document.getElementById('ping').textContent = data.ping + ' ms'
  document.getElementById('alive').textContent = data.alive ? '✅ Alive' : '❌ Unreachable'

  document.getElementById('modal').classList.remove('hidden')
}

document.getElementById('close').onclick = () => {
  document.getElementById('modal').classList.add('hidden')
}

loadStatuses()
setInterval(loadStatuses, 30000)
