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

app.use('/', express.static('../data'))

app.listen(port, () => {
  console.log(`Startup at http://localhost:${port}`)
})
