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
//       /  \ 2  /
//      / 1  \  /
//     /------\/
let renderTile = (canvas, center, orientation, color) => {
  let rad = 50
  let rad2 = rad - 5

  // TBD: orientatin -> angle in rad
  let theta = Math.PI / 2

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
  let rad = 50
  let rad2 = rad - 25

  // TBD: orientatin -> angle in rad
  let theta = Math.PI / 2

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

let tileToCanvasPos = (tile) => {
  return {
    x: tile.x,
    y: tile.y
  }
}

let renderTileField = (field) => {

}