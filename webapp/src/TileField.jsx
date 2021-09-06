import React, { useEffect, useRef, useState } from 'react'

// This is the size of the tiles (radius of the bounding circle for the equilateral triangle)
const rad = 80

const TileField = props => {

  const sizeRef = useRef(null)
  const canvasRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState({width: 300, height: 600})

  useEffect(() => {
    const parent = sizeRef.current
    if (parent.clientWidth !== canvasSize.width || parent.clientHeight !== canvasSize.height) {
      console.log(`${parent.clientWidth} x ${parent.clientHeight}`)
      setCanvasSize({width: parent.clientWidth, height: parent.clientHeight})
    }
    const canvas = canvasRef.current
    var ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    renderTileField(canvas, props.field.tiles, props.mode !== null)
  }, [props.field, props.mode, canvasSize])

  let clickOnCanvas = (event) => {
    const canvas = canvasRef.current
    const tilePos = canvasPosToTile({ x: event.clientX - canvas.offsetLeft, y: event.clientY - canvas.offsetTop })
    props.onCanvasClick(tilePos)
  }
  
  return (
    <div ref={sizeRef} style={{ width: '100vh', height: '90vh' }}>
      <div style={{display: 'flex', height: 'auto', minHeight: '100%', minWidth: '90%'}}>
        <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height} onClick={clickOnCanvas}/>
      </div>
    </div>)
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
let renderTileField = (canvas, field, showIndices) => {
  for (let tile of field) {
    let pos = tilePosToCanvasPos(tile.pos)
    let orientation = (Math.PI / 2) + ((1 - tile.pos.z) * Math.PI)
    switch (tile.type) {
      case 'control':
        renderControlTile(canvas, pos, orientation)
        break
      case 'light':
        renderLightTile(canvas, pos, orientation, tile.color ?? "#fff", showIndices ? tile.index : null)
        break
    }
  }

  renderTileGridLines(canvas, "#ddd")
}

let renderTileGridLines = (canvas, color) => {
  // TODO: Figure out bounds from canvasPosToTile once implemented
  let topLeft = canvasPosToTile({x: 0, y: 0})
  let topRight = canvasPosToTile({x: canvas.width, y: 0})
  let bottomLeft = canvasPosToTile({x: 0, y: canvas.height})
  let bottomRight = canvasPosToTile({x: canvas.width, y: canvas.height})

  const downLeftSpread = Math.max(topRight.x - topLeft.x, bottomLeft.y - topLeft.y)
  var ctx = canvas.getContext('2d')
  for (let x=0; x < downLeftSpread * 2; x++) {
    // Down-left
    let orientation = (Math.PI / 2) + ((1 - 0) * Math.PI)
    let theta = orientation
    let center1 = tilePosToCanvasPos({x: x, y: 0, z: 0})
    let center2 = tilePosToCanvasPos({x: x, y: downLeftSpread, z: 0})
    
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(center1.x + Math.cos(theta) * rad, center1.y + Math.sin(theta) * rad)
    ctx.lineTo(center2.x + Math.cos(theta) * rad, center2.y + Math.sin(theta) * rad)
    ctx.stroke()
  }

  const downRightSpread = Math.max(topRight.x - topLeft.x, bottomLeft.y - topLeft.y)
  for (let x=0; x < downRightSpread * 2; x++) {
    // Down-right
    let orientation = (Math.PI / 2) + ((1 - 1) * Math.PI)
    let theta = orientation
    let center1 = tilePosToCanvasPos({x: bottomLeft.x + x - downRightSpread, y: topLeft.y, z: 1})
    let center2 = tilePosToCanvasPos({x: bottomLeft.x + x, y: topLeft.y + downRightSpread, z: 1})
    
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(center1.x + Math.cos(theta) * rad, center1.y + Math.sin(theta) * rad)
    ctx.lineTo(center2.x + Math.cos(theta) * rad, center2.y + Math.sin(theta) * rad)
    ctx.stroke()
  }

  for (let y=topLeft.y; y < bottomLeft.y; y++) {
    // Horizontal
    let orientation = (Math.PI / 2) + ((1 - 0) * Math.PI)
    let theta = orientation
    let center1 = tilePosToCanvasPos({x: topLeft.x, y: y, z: 0})
    let center2 = tilePosToCanvasPos({x: bottomRight.x, y: y, z: 0})
    
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(center1.x + Math.cos(theta) * rad, center1.y + Math.sin(theta) * rad)
    ctx.lineTo(center2.x + Math.cos(theta) * rad, center2.y + Math.sin(theta) * rad)
    ctx.stroke()
  }
}

let renderLightTile = (canvas, center, orientation, color, index) => {
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

  if (index !== null) {
    ctx.strokeStyle = '#000'
    ctx.fillStyle = '#fff'
    ctx.font = 'normal bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText(index, center.x, center.y);
    ctx.strokeText(index, center.x, center.y);
  }
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
  let h = Math.sin(Math.PI / 6)

  const x = rad + 2 * base * tilePos.x - base * tilePos.y + base * tilePos.z
  const y = rad * (1 + (1 + h) * tilePos.y - (1 - h) * tilePos.z)
  //console.log(`${tilePos.x},${tilePos.y},${tilePos.z} => ${x}, ${y}`)
  return {x, y}
}

export const canvasPosToTile = (pos) => {
  let base = rad * Math.cos(Math.PI / 6)
  let h = Math.sin(Math.PI / 6)

  const tilePosY0 = ((pos.y / rad) - 1 + (1 - h) * 0) / (1 + h)
  const tilePosX0 = ((pos.x - rad) / base + tilePosY0 - 0) / 2
  const tilePosY1 = ((pos.y / rad) - 1 + (1 - h) * 1) / (1 + h)
  const tilePosX1 = ((pos.x - rad) / base + tilePosY1 - 1) / 2

  const canvasPos0 = tilePosToCanvasPos({x: Math.round(tilePosX0), y: Math.round(tilePosY0), z: 0})
  const dist0 = Math.sqrt(Math.pow(pos.x - canvasPos0.x, 2) + Math.pow(pos.y - canvasPos0.y, 2))
  const canvasPos1 = tilePosToCanvasPos({x: Math.round(tilePosX1), y: Math.round(tilePosY1), z: 1})
  const dist1 = Math.sqrt(Math.pow(pos.x - canvasPos1.x, 2) + Math.pow(pos.y - canvasPos1.y, 2))
  
  let x = Math.round(tilePosX0)
  let y = Math.round(tilePosY0)
  let z = 0
  if (dist1 < dist0) {
    x = Math.round(tilePosX1)
    y = Math.round(tilePosY1)
    z = 1
  }
  
  //console.log(`Map ${pos.x},${pos.y} => ${x},${y},${z}`)
  return { x, y, z }
}
