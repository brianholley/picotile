import React, { useEffect, useRef } from 'react'

const TileField = props => {

  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    renderTileField(canvas, props.field)
  }, [])
  
  return <canvas ref={canvasRef} width='300' height='300' {...props}/>
}

export default TileField

// Tile and tile field rendering
//
// Tile field looks like a skewed x/y grid. Each grid cell
// is a triangle pair in a diamond shape, z distinguishes
// left/right triangle.
//
// (x, y, z) ->
//   x-----------------------------|
//  y        /--/--/--/--/--/--/--/
//  |       /--/--/--/--/--/--/--/
//  |      /--/--/--/--/--/--/--/
//  |     /--/--/--/--/--/--/--/
//  |    /--/--/--/--/--/--/--/
//  |   /--/--/--/--/--/--/--/
//  -  /--/--/--/--/--/--/--/
//
//  z     /\------/
//       /  \ 1  /
//      / 0  \  /
//     /------\/
let renderTileField = (canvas, field) => {
  for (let tile of field) {
    let pos = tileToCanvasPos(tile)
    let orientation = (Math.PI / 2) + ((1 - tile.pos.z) * Math.PI)
    switch (tile.type) {
      case 'control':
        renderControlTile(canvas, pos, orientation)
        break
      case 'light':
        renderLightTile(canvas, pos, orientation, tile.color)
        break
    }
  }
}

const rad = 50

let renderLightTile = (canvas, center, orientation, color) => {
  let rad2 = rad - 5

  let theta = orientation

  var ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(center.x + Math.cos(theta) * rad, center.y + Math.sin(theta) * rad)
  ctx.lineTo(center.x + Math.cos(theta + 2 * Math.PI / 3) * rad, center.y + Math.sin(theta + 2 * Math.PI / 3) * rad)
  ctx.lineTo(center.x + Math.cos(theta + 4 * Math.PI / 3) * rad, center.y + Math.sin(theta + 4 * Math.PI / 3) * rad)
  ctx.fill()

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(center.x + Math.cos(theta) * rad2, center.y + Math.sin(theta) * rad2)
  ctx.lineTo(center.x + Math.cos(theta + 2 * Math.PI / 3) * rad2, center.y + Math.sin(theta + 2 * Math.PI / 3) * rad2)
  ctx.lineTo(center.x + Math.cos(theta + 4 * Math.PI / 3) * rad2, center.y + Math.sin(theta + 4 * Math.PI / 3) * rad2)
  ctx.fill()
}

let renderControlTile = (canvas, center, orientation) => {
  let rad2 = rad - 25

  let theta = orientation

  var ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(center.x + Math.cos(theta) * rad, center.y + Math.sin(theta) * rad)
  ctx.lineTo(center.x + Math.cos(theta + 2 * Math.PI / 3) * rad, center.y + Math.sin(theta + 2 * Math.PI / 3) * rad)
  ctx.lineTo(center.x + Math.cos(theta + 4 * Math.PI / 3) * rad, center.y + Math.sin(theta + 4 * Math.PI / 3) * rad)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.moveTo(center.x + Math.cos(theta) * rad2, center.y + Math.sin(theta) * rad2)
  ctx.lineTo(center.x + Math.cos(theta + 2 * Math.PI / 3) * rad2, center.y + Math.sin(theta + 2 * Math.PI / 3) * rad2)
  ctx.lineTo(center.x + Math.cos(theta + 4 * Math.PI / 3) * rad2, center.y + Math.sin(theta + 4 * Math.PI / 3) * rad2)
  ctx.fill()
}

// TODO: Insert more helpful geometry diagram
let tileToCanvasPos = (tile) => {
  let base = rad * Math.cos(Math.PI / 6)
  let h = rad * Math.sin(Math.PI / 6)

  const x = rad + 2 * base * tile.pos.x - base * tile.pos.y + base * tile.pos.z
  const y = rad + (rad + h) * tile.pos.y - (rad - h) * tile.pos.z
  console.log(`${tile.pos.x},${tile.pos.y},${tile.pos.z} => ${x}, ${y}`)
  return {x, y}
}

let canvasPosToTile = (pos) => {
  return {
    x: 0,
    y: 0,
    z: 0
  }
}
