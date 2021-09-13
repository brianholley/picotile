const cors = require('cors')
const express = require('express')
const ws = require('ws')

const app = express()
const httpPort = 80
const wsPort = 81

app.use(cors())

var settings = {
  onOff: true,
  brightness: 128,
  speed: 128,
  mode: 'automatic'
}

// TODO: Remove default tiles
let tiles = {
  version: 1,
  maxTiles: 20,
  tiles: [
    {type: 'control', pos: {x: 4, y: 5, z: 1}}, 
    {type: 'light', index: 0, pos: {x: 4, y: 4, z: 0}, color: '#b0b'},
    {type: 'light', index: 1, pos: {x: 3, y: 4, z: 1}, color: '#4B0082'},
    {type: 'light', index: 2, pos: {x: 3, y: 3, z: 0}, color: '#00c'},
    {type: 'light', index: 3, pos: {x: 3, y: 3, z: 1}, color: '#0d0'},
    {type: 'light', index: 4, pos: {x: 3, y: 2, z: 0}, color: '#dd0'},
    {type: 'light', index: 5, pos: {x: 2, y: 2, z: 1}, color: '#d70'},
    {type: 'light', index: 6, pos: {x: 2, y: 2, z: 0}, color: '#c00'},
  ]
}

let hue = 0

const modes = [
  'automatic',
  'single',
  'manual'
]

const patterns = [
  'fire',
  'firefly',
  'rainbow',
  'starburst',
]
let currentPattern = 'fire'

const onSetMode = event => {
  if (event.mode in modes) {
    settings.mode = event.mode
  }
}

const onSetPattern = event => {
  if (settings.mode === 'single') {
    currentPattern = event.pattern
  }
}

const onSetTile = event => {
  if (settings.mode === 'manual') {
    let tile = tiles.tiles.find(t => t.index === event.index)
    if (tile !== null) {
      tile.color = event.color
    }
    else {
      console.log(`Tile ${event.index} not found`)
    }
  }
}

const websocketClientEvents = {
  setMode: onSetMode,
  setPattern: onSetPattern,
  setTile: onSetTile,
}

console.log(`Startup at ws://localhost:${wsPort}`)
const wsServer = new ws.Server({ port: wsPort })
wsServer.on('connection', socket => {
  console.log('client connected!')

  socket.on('message', message => {
    const event = JSON.parse(message)
    if (event.type in websocketClientEvents) {
      websocketClientEvents[event.type](event)
    }
    else {
      console.log(`No handler found for event ${event.type}`)
    }
  })

  const patternTimer = setInterval(() => sendRandomPattern(socket), 10000)
  const tileColorsTimer = setInterval(() => sendTileColors(socket), 30)

  sendRandomPattern(socket)
  sendTileColors(socket)

  socket.on('close', socket => {
    console.log('client disconnected!')

    clearInterval(patternTimer)
    clearInterval(tileColorsTimer)
  })
})

let sendRandomPattern = (socket) => {
  if (settings.mode === 'automatic') {
    currentPattern = patterns[Math.floor(Math.random() * patterns.length)]
  }

  if (settings.mode !== 'manual') {
    const message = { type: 'pattern', data: currentPattern }
    //console.log(message)
    socket.send(JSON.stringify(message))
  }
}

let sendTileColors = (socket) => {
  
  if (settings.mode !== 'manual') {
    hue = (hue + 2) % 360
    //console.log(`sendTileColors ${hue}`)

    for (var i = 0; i < tiles.tiles.length; i++) {
      if (tiles.tiles[i].type === 'light') {
        const rgb = hue2rgb((hue + 10 * i) % 360)
        const color = '#' + rgb.r.toString(16).padStart(2, '0') + rgb.g.toString(16).padStart(2, '0') + rgb.b.toString(16).padStart(2, '0')
        tiles.tiles[i].color = color
      }
    }
  }
  
  let message = { type: 'tileColors', tiles: [] }
  for (var tile of tiles.tiles) {
    if (tile.type === 'light') {
      message.tiles.push({index: tile.index, color: tile.color})
    }
  }
  socket.send(JSON.stringify(message))
}

// Extremely hacky function to map hue to rgb for easy testing
let hue2rgb = (hue) => {
  if (hue <= 60) {
    return {r: 255, g: Math.floor((hue / 60) * 255), b: 0}
  }
  else if (hue <= 120) {
    return {r: 255 - Math.floor(((hue - 60) / 60) * 255), g: 255, b: 0}
  }
  else if (hue <= 180) {
    return {r: 0, g: 255, b: Math.floor(((hue - 120) / 60) * 255)}
  }
  else if (hue <= 240) {
    return {r: 0, g: 255 - Math.floor(((hue - 180) / 60) * 255), b: 255}
  }
  else if (hue <= 300) {
    return {r: Math.floor(((hue - 240) / 60) * 255), g: 0, b: 255}
  }
  else {
    return {r: 255, g: 0, b: 255 - Math.floor(((hue - 300) / 60) * 255)}
  }
}

app.get('/settings', (req, res) => {
  res.send(settings)
})

app.post('/settings', (req, res) => {
  settings.onOff = req.query.onOff
  settings.brightness = req.query.brightness
  settings.speed = req.query.speed
  settings.mode = req.query.mode
  res.send(settings)
})

app.get('/tiles', (req, res) => {
  res.send(JSON.stringify(tiles))
})

app.post('/tiles/add', (req, res) => {
  let index = parseInt(req.query.index)
  let x = parseInt(req.query.x)
  let y = parseInt(req.query.y)
  let z = parseInt(req.query.z)
  let type = req.query.type
  tiles.tiles.push({index, pos: {x, y, z}, type})
  res.statusCode = 201
  res.send(JSON.stringify(tiles))
})

app.post('/tiles/delete', (req, res) => {
  let index = parseInt(req.query.index)
  let removed = tiles.tiles.filter((t) => t.index !== index)
  console.log(`Delete tile ${index}, updated tile count ${removed.length}`)
  tiles.tiles = removed
  for (let t of tiles.tiles) {
    if (t.index > index) {
      t.index--
    }
  }
  res.statusCode = 200
  res.send(JSON.stringify(tiles))
})

app.post('/tiles/update', (req, res) => {
  let x = parseInt(req.query.x)
  let y = parseInt(req.query.y)
  let z = parseInt(req.query.z)
  let newX = parseInt(req.query.newX)
  let newY = parseInt(req.query.newY)
  let newZ = parseInt(req.query.newZ)
  let newType = parseInt(req.query.newType)
  
  let tile = tiles.filter((t) => t.pos.x === x && t.pos.y === y && t.pos.z === z)
  tile.pos = {x: newX, y: newY, z: newZ }
  type.type = newType
  res.statusCode = 200
  res.send(JSON.stringify(tiles))
})

app.get('/', (req, res) => {
  let response = {
    routes: [
      'GET /settings',
      'GET /tiles',
      'POST /settings',
      'POST /tiles/add',
      'POST /tiles/delete',
      'POST /tiles/update'
    ]
  }
  res.statusCode = 404
  res.send(JSON.stringify(response))
})

app.listen(httpPort, () => {
  console.log(`Startup at http://localhost:${httpPort}`)
})
