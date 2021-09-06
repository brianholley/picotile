import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
  } from "react-router-dom";
  
import './styles.css';

import Menu from './Menu'
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
    mode: 0
}

let PicotileApp = props => {

    const [loaded, setLoaded] = useState(false)
    const [pattern, setPattern] = useState('Pattern')
    const [tileField, setTileField] = useState(defaultTileField)
    const [settings, setSettings] = useState(defaultSettings)
    const [editMode, setEditMode] = useState(null)

    useEffect(() => {
        let loadAsync = async () => {
            if (!loaded) {
                setLoaded(true)

                let tileQuery = await Api.getTiles();
                setTileField(tileQuery)

                let settingsQuery = await Api.getSettings()
                setSettings(settingsQuery)

                Api.connect()
                Api.registerCallback('pattern', message => {
                    setPattern(message.data)
                })
                Api.registerCallback('tileColors', message => {
                    let updatedTiles = { ...tileField }
                    for (let inTile of message.tiles) {
                        const tile = updatedTiles.tiles.filter(t => t.index === inTile.index)
                        if (tile.lenth > 0) {
                            tile[0].color = tile.color
                        }
                    }
                    setTileField(updatedTiles)
                })
            }
        }
        loadAsync()
    }, [loaded, tileField, settings])

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

    let onCanvasClick = async (tilePos) => {
        let selected = tileField.tiles.filter(t => t.pos.x === tilePos.x && t.pos.y === tilePos.y && t.pos.z === tilePos.z)
        if (editMode === 'Add') {
            if (selected.length === 0) {
                onTileAdd(tilePos)
            }
        }
        else if (editMode === 'Remove') {
            if (selected.length > 0) {
                onTileRemove(selected[0])
            }
        }
    }

    let onTileAdd = async (pos) => {
        let nextIndex = tileField.tiles.reduce((index, tile) => tile.type == 'light' ? Math.max(index, tile.index) : index, 0) + 1
        let tile = {type: 'light', index: nextIndex, pos: {x: pos.x, y: pos.y, z: pos.z}}
        let updatedTileField = {...tileField}
        updatedTileField.tiles.push(tile)
        setTileField(updatedTileField)

        await Api.addTile(tile.index, pos.x, pos.y, pos.z, 'light')
    }

    let onTileRemove = async (tile) => {
        let updatedTileField = {
            ...tileField,
            tiles: tileField.tiles.filter(t => t.index !== tile.index)
        }
        for (var t of updatedTileField.tiles) {
            if (t.index > tile.index) {
                t.index--
            }
        }
        setTileField(updatedTileField)

        await Api.removeTile(tile.index)
    }

    return (
        <Router>
            <div className="App">
                <Menu />
                <Switch>
                    <Route exact path="/">
                        <div style={{textAlign: 'center'}}>Current pattern: {pattern}</div>
                        <TileField field={tileField} mode={editMode} onCanvasClick={onCanvasClick} />
                        <div>
                            <button onClick={() => setEditMode('Add')}>+</button>
                            <button onClick={() => setEditMode('Remove')}>-</button>
                            <button>Manual</button>
                            { (editMode !== null) && <button onClick={() => setEditMode(null)}>X</button> }
                            { (editMode === 'Add') && <span>Click to add a new tile</span> }
                            { (editMode === 'Remove') && <span>Click to remove a tile</span> }
                        </div>
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
