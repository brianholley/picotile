const cors = require('cors')
const express = require('express')
const ws = require('ws')

const app = express()
const port = 80

app.use(cors())

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => console.log(message));
});

var settings = {
  onOff: true,
  brightness: 128,
  speed: 128,
  mode: 0
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

const server = app.listen(port, () => {
  console.log(`Startup at http://localhost:${port}`)
})

// Handle websocket connection upgrade requests and pass off to WS server
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});
