import React, { useEffect, useRef, useState } from 'react';

import EditControls from './EditControls'
import PatternControls from './PatternControls'
import TileField from './TileField'

import * as Api from './api'

const defaultTileField = {
    version: 1,
    maxTiles: 20,
    tiles: [
        {type: 'control', pos: {x: 4, y: 5, z: 1}}, 
    ]
}

let Live = props => {

    const loaded = useRef(false)
    const [pattern, setPattern] = useState('pattern')
    const [tileField, setTileField] = useState(defaultTileField)
    const [editMode, setEditMode] = useState(false)
    const [manualColor, setManualColor] = useState('#0000ff')

    useEffect(() => {
        let loadAsync = async () => {
            if (!loaded.current) {
                loaded.current = true

                let tileQuery = await Api.getTiles();
                setTileField(tileQuery)

                Api.registerCallback('pattern', message => {
                    setPattern(message.data)
                })
                Api.registerCallback('tileColors', onUpdateTileColors)
            }
        }
        loadAsync()
        return () => {/* TODO: Cleanup! */}
    }, [loaded, tileField])

    let onUpdateTileColors = message => {
        setTileField(currentTileField => {
            let updatedTiles = { ...currentTileField }
            for (let inTile of message.tiles) {
                const tile = updatedTiles.tiles.find(t => t.index === inTile.index)
                if (tile) {
                    tile.color = inTile.color
                }
            }
            return updatedTiles
        })
    }

    let onCanvasClick = (tilePos) => {
        let selected = tileField.tiles.filter(t => t.pos.x === tilePos.x && t.pos.y === tilePos.y && t.pos.z === tilePos.z)
        if (editMode) {
            if (selected.length === 0) {
                onTileAdd(tilePos)
            }
            else {
                onTileRemove(selected[0])
            }
        }
        if (props.mode === 'manual') {
            if (selected.length > 0) {
                Api.sendSetTile(selected[0].index, manualColor)
                setTileField(currentTileField => {
                    let updatedTiles = { ...currentTileField }
                    const tile = updatedTiles.tiles.find(t => t.index === selected[0].index)
                    if (tile) {
                        tile.color = manualColor
                    }
                    return updatedTiles
                })
            }
        }
    }

    let onTileAdd = (pos) => {
        let nextIndex = tileField.tiles.reduce((index, tile) => tile.type === 'light' ? Math.max(index, tile.index) : index, -1) + 1
        const r = Math.floor(Math.random() * 256)
        const g = Math.floor(Math.random() * 256)
        const b = Math.floor(Math.random() * 256)
        const color = r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0')

        let tile = {type: 'light', index: nextIndex, pos: {x: pos.x, y: pos.y, z: pos.z}, color}
        let updatedTileField = {...tileField}
        updatedTileField.tiles.push(tile)
        setTileField(updatedTileField)

        Api.addTile(tile.index, pos.x, pos.y, pos.z, 'light')
    }

    let onTileRemove = (tile) => {
        let updatedTileField = {...tileField}
        updatedTileField.tiles = tileField.tiles.filter(t => t.index !== tile.index)
        for (let t of updatedTileField.tiles) {
            if (t.index > tile.index) {
                t.index--
            }
        }
        setTileField(updatedTileField)

        Api.removeTile(tile.index)
    }

    let onSwitchLedMode = () => {
        let mode
        if (props.mode === 'automatic') {
            mode = 'single'
        }
        else if (props.mode === 'single') {
            mode = 'manual'
        } 
        else {
            mode = 'automatic'
        }
        props.setMode(mode)
    }

    let onSwitchPattern = (pattern) => {
        setPattern(pattern)
        Api.sendSetPattern(pattern)
    }

    let onColorChangeComplete = (color, event) => {
        setManualColor(color.hex)
    }

    const patternHeight = 38
    const editControlsHeight = 38 + (props.mode === 'manual' ? 16 : 0)
    const canvasHeight = props.height - patternHeight - editControlsHeight;

    return (
        <div>
            <PatternControls mode={props.mode} onSwitchLedMode={onSwitchLedMode} pattern={pattern} onSwitchPattern={onSwitchPattern} height={patternHeight} />
            <TileField field={tileField} showIndices={editMode} onCanvasClick={onCanvasClick} width={props.width} height={canvasHeight} />
            <EditControls editMode={editMode} setEditMode={setEditMode} mode={props.mode} manualColor={manualColor} onColorChangeComplete={onColorChangeComplete} height={editControlsHeight} />
        </div>
    )
}

export default Live
