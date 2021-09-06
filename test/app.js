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
  mode: 0
}

let tiles = {
  version: 1,
  maxTiles: 20,
  tiles: [
    {type: 'control', pos: {x: 4, y: 5, z: 1}}, 
    {type: 'light', index: 0, pos: {x: 4, y: 4, z: 0}},
    {type: 'light', index: 0, pos: {x: 3, y: 4, z: 1}},
    {type: 'light', index: 0, pos: {x: 3, y: 3, z: 0}},
    {type: 'light', index: 0, pos: {x: 3, y: 3, z: 1}},
    {type: 'light', index: 0, pos: {x: 3, y: 2, z: 0}},
    {type: 'light', index: 0, pos: {x: 2, y: 2, z: 1}},
    {type: 'light', index: 0, pos: {x: 2, y: 2, z: 0}},
  ]
}

let hue = 0

let activeSockets = []

const patterns = [
  "Fire",
  "Firefly",
  "Rainbow",
  "Starburst",
]

console.log(`Startup at ws://localhost:${wsPort}`)
const wsServer = new ws.Server({ port: wsPort })
wsServer.on('connection', socket => {
  console.log('client connected!')
  activeSockets.push(socket)

  socket.on('message', message => console.log(message))
  socket.on('close', socket => {
    console.log('client disconnected!')
    activeSockets = activeSockets.filter(s => s !== socket)
  })

  sendRandomPattern(socket)
  sendTileColors(socket)
});

const isClientActive = (socket) => {
  return activeSockets.filter(s => s === socket).length > 0
}

let sendRandomPattern = (socket) => {
  if (!isClientActive(socket)) {
    return
  }

  const index = Math.floor(Math.random() * patterns.length)
  const message = { type: 'pattern', data: patterns[index] }
  console.log(message)
  socket.send(JSON.stringify(message))
  setTimeout(() => {
    sendRandomPattern(socket)
  }, 10000)
}

let sendTileColors = (socket) => {
  if (!isClientActive(socket)) {
    return
  }

  console.log(`sendTileColors ${hue}`)
  hue = (hue + 10) % 360
  
  let message = { type: 'tileColors', tiles: [] }
  for (var i = 0; i < tiles.tiles.length; i++) {
    if (tiles.tiles[i].type === 'light') {
      const rgb = hue2rgb((hue + 10 * i) % 360)
      const color = '#' + rgb.r.toString(16).padStart(2, '0') + rgb.g.toString(16).padStart(2, '0') + rgb.b.toString(16).padStart(2, '0')
      message.tiles.push({index: i, color})
    }
  }
  socket.send(JSON.stringify(message))
  setTimeout(() => {
    sendTileColors(socket)
  }, 2000)
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
  let x = req.query.x
  let y = req.query.y
  let z = req.query.z
  let type = req.query.type
  tiles.push({pos: {x, y, z}, type})
  res.statusCode = 201
  res.send(JSON.stringify(tiles))
})

app.post('/tiles/delete', (req, res) => {
  let x = req.query.x
  let y = req.query.y
  let z = req.query.z
  
  tiles = tiles.filter((t) => t.pos.x !== x || t.pos.y !== y || t.pos.z !== z)
  res.statusCode = 200
  res.send(JSON.stringify(tiles))
})

app.post('/tiles/update', (req, res) => {
  let x = req.query.x
  let y = req.query.y
  let z = req.query.z
  let newX = req.query.newX
  let newY = req.query.newY
  let newZ = req.query.newZ
  let newType = req.query.newType
  
  let tile = tiles.filter((t) => t.pos.x == x && t.pos.y == y && t.pos.z == z)
  tile.pos = {x: newX, y: newY, z: newZ }
  type.type = newType
  res.statusCode = 200
  res.send(JSON.stringify(tiles))
})

app.get('/', (req, res) => {
  let response = {
    routes: [
      "GET /settings",
      "GET /tiles",
      "POST /settings",
      "POST /tiles/add",
      "POST /tiles/delete",
      "POST /tiles/update"
    ]
  }
  res.statusCode = 404
  res.send(JSON.stringify(response))
})

app.listen(httpPort, () => {
  console.log(`Startup at http://localhost:${httpPort}`)
})
