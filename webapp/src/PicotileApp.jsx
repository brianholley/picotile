import React, { useEffect, useRef, useState } from 'react';
import { HuePicker  } from 'react-color';
import {
    BrowserRouter as Router,
    Switch,
    Route
  } from "react-router-dom";
  
import './styles.css';

import EditControls from './EditControls'
import Menu from './Menu'
import PatternControls from './PatternControls'
import Settings from './Settings'
import TileField from './TileField'

import * as Api from './api'

const defaultTileField = {
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

const defaultSettings = {
    brightness: 255,
    speed: 0,
    mode: 'automatic'
}

let PicotileApp = props => {

    const loaded = useRef(false)
    const [pattern, setPattern] = useState('pattern')
    const [tileField, setTileField] = useState(defaultTileField)
    const [settings, setSettings] = useState(defaultSettings)
    const [editMode, setEditMode] = useState(false)
    const [manualColor, setManualColor] = useState('#0000ff')

    useEffect(() => {
        let loadAsync = async () => {
            if (!loaded.current) {
                loaded.current = true

                let tileQuery = await Api.getTiles();
                setTileField(tileQuery)

                let settingsQuery = await Api.getSettings()
                setSettings(settingsQuery)

                Api.connect()
                Api.registerCallback('pattern', message => {
                    setPattern(message.data)
                })
                Api.registerCallback('tileColors', onUpdateTileColors)
            }
        }
        loadAsync()
        return () => {/* TODO: Cleanup! */}
    }, [loaded, tileField, settings])

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

    let onChangeSetting = async (newSettings) => {
        let oldSettings = settings
        setSettings(newSettings)
        try {
            await Api.postSettings(newSettings)
        }
        catch {
            console.log("Error")
            setSettings(oldSettings)
        }
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
        if (settings.mode === 'manual') {
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
        let nextIndex = tileField.tiles.reduce((index, tile) => tile.type == 'light' ? Math.max(index, tile.index) : index, -1) + 1
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

    let onSwitchLedMode = async () => {
        let updatedSettings = null
        if (settings.mode === 'automatic') {
            updatedSettings = {
                ...settings,
                mode: 'single'
            }
        }
        else if (settings.mode === 'single') {
            updatedSettings = {
                ...settings,
                mode: 'manual'
            }
        } 
        else {
            updatedSettings = {
                ...settings,
                mode: 'automatic'
            }
        }
        setSettings(updatedSettings)

        await Api.postSettings(updatedSettings)
    }

    let onColorChangeComplete = (color, event) => {
        setManualColor(color.hex)
    }

    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight

    const menuHeight = 61
    const patternHeight = 38
    const editControlsHeight = 38 + (settings.mode === 'manual' ? 16 : 0)
    const canvasHeight = windowHeight - menuHeight - patternHeight - editControlsHeight;

    return (
        <Router>
            <div className="App">
                <Menu height={menuHeight} />
                <Switch>
                    <Route exact path="/">
                        <PatternControls mode={settings.mode} onSwitchLedMode={onSwitchLedMode} pattern={pattern} height={patternHeight} />
                        <TileField field={tileField} showIndices={editMode} onCanvasClick={onCanvasClick} width={windowWidth} height={canvasHeight} />
                        <EditControls editMode={editMode} setEditMode={setEditMode} mode={settings.mode} manualColor={manualColor} onColorChangeComplete={onColorChangeComplete} height={editControlsHeight} />
                    </Route>
                    <Route exact path="/settings">
                        <Settings settings={settings} onChangeSetting={onChangeSetting} />
                    </Route>
                </Switch>
            </div>
        </Router>
    )
}

export default PicotileApp
