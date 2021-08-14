import React, { useEffect, useRef } from 'react'

const TileField = props => {

  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current  
    var ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderTileField(canvas, props.field.tiles)
  }, [props.field])
  
  return <canvas ref={canvasRef} width='300' height='600' {...props}/>
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
    let pos = tilePosToCanvasPos(tile.pos)
    let orientation = (Math.PI / 2) + ((1 - tile.pos.z) * Math.PI)
    switch (tile.type) {
      case 'control':
        renderControlTile(canvas, pos, orientation)
        break
      case 'light':
        renderLightTile(canvas, pos, orientation, tile.color ?? "#fff")
        break
    }
  }

  renderTileGridLines(canvas, "#ddd")
}

let renderTileGridLines = (canvas, color) => {
  let rad2 = rad - 5

  // TODO: Figure out bounds from canvasPosToTile once implemented
  var ctx = canvas.getContext('2d')
  for (let x=0; x < 10; x++) {
    // Down-left
    let orientation = (Math.PI / 2) + ((1 - 0) * Math.PI)
    let theta = orientation
    let center1 = tilePosToCanvasPos({x: x, y: 0, z: 0})
    let center2 = tilePosToCanvasPos({x: x, y: 10, z: 0})
    
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(center1.x + Math.cos(theta) * rad, center1.y + Math.sin(theta) * rad)
    ctx.lineTo(center2.x + Math.cos(theta) * rad, center2.y + Math.sin(theta) * rad)
    ctx.stroke()
  }

  for (let x=-5; x < 5; x++) {
    // Down-right
    let orientation = (Math.PI / 2) + ((1 - 1) * Math.PI)
    let theta = orientation
    let center1 = tilePosToCanvasPos({x: x, y: -1, z: 1})
    let center2 = tilePosToCanvasPos({x: x+10, y: 9, z: 1})
    
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(center1.x + Math.cos(theta) * rad, center1.y + Math.sin(theta) * rad)
    ctx.lineTo(center2.x + Math.cos(theta) * rad, center2.y + Math.sin(theta) * rad)
    ctx.stroke()
  }

  for (let y=0; y < 10; y++) {
    // Horizontal
    let orientation = (Math.PI / 2) + ((1 - 0) * Math.PI)
    let theta = orientation
    let center1 = tilePosToCanvasPos({x: 0, y: y, z: 0})
    let center2 = tilePosToCanvasPos({x: 10, y: y, z: 0})
    
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(center1.x + Math.cos(theta) * rad, center1.y + Math.sin(theta) * rad)
    ctx.lineTo(center2.x + Math.cos(theta) * rad, center2.y + Math.sin(theta) * rad)
    ctx.stroke()
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
let tilePosToCanvasPos = (tilePos) => {
  let base = rad * Math.cos(Math.PI / 6)
  let h = rad * Math.sin(Math.PI / 6)

  const x = rad + 2 * base * tilePos.x - base * tilePos.y + base * tilePos.z
  const y = rad + (rad + h) * tilePos.y - (rad - h) * tilePos.z
  console.log(`${tilePos.x},${tilePos.y},${tilePos.z} => ${x}, ${y}`)
  return {x, y}
}

let canvasPosToTile = (pos) => {
  return {
    x: 0,
    y: 0,
    z: 0
  }
}
