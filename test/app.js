const express = require('express')
const app = express()
const port = 3000

app.get('/config', (req, res) => {
  let config = {
    maxTiles: 9,
    brightness: 128
  }
  res.send(config)
})

let tiles = [{
  type: 'control',
  pos: {x: 1, y: 1, z: 1}
}, {
  type: 'light',
  index: 0,
  pos: {x: 0, y: 0, z: 1},
  color: '#f00'
}]

app.get('/tiles', (req, res) => {
  res.send(JSON.stringify(tiles))
})

app.post('/tiles', (req, res) => {
  const diff = JSON.parse(req.body)
  const op = diff.op
  switch (op) {
    case 'add':
      tiles.push({
        type: diff.type,
        index: diff.index,
        pos: diff.pos,
        color: diff.color
      })
      res.statusCode = 201
      res.send()
      break
    case 'update':
      if (diff.type === 'light') {
        let tile = tiles.filter((t) => t.index === diff.index)
        tile.pos = diff.pos
        tile.color = diff.color
      } else if (diff.type === 'control') {
        let tile = tiles.filter((t) => t.type === diff.type)
        tile.pos = diff.pos
      }
      res.statusCode = 200
      res.send()
      break
    case 'delete':
      if (diff.type === 'light') {
        tiles = tiles.filter((t) => t.index !== diff.index)
      } else if (diff.type === 'control') {
        tiles = tiles.filter((t) => t.type !== diff.type)
      }
      res.statusCode = 200
      res.send()
      break
    default:
      res.statusCode = 400
      res.send({error: 'Invalid operation'})
  }
})

app.use('/', express.static('../data'))

app.listen(port, () => {
  console.log(`Startup at http://localhost:${port}`)
})
