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

const defaultTiles = {
    version: 1,
    maxTiles: 20,
    tiles: [
        {type: 'control', pos: {x: 4, y: 5, z: 1}}, 
        {type: 'light', index: 0, pos: {x: 4, y: 4, z: 0}, color: '#b0b'},
        {type: 'light', index: 0, pos: {x: 3, y: 4, z: 1}, color: '#4B0082'},
        {type: 'light', index: 0, pos: {x: 3, y: 3, z: 0}, color: '#00c'},
        {type: 'light', index: 0, pos: {x: 3, y: 3, z: 1}, color: '#0d0'},
        {type: 'light', index: 0, pos: {x: 3, y: 2, z: 0}, color: '#dd0'},
        {type: 'light', index: 0, pos: {x: 2, y: 2, z: 1}, color: '#d70'},
        {type: 'light', index: 0, pos: {x: 2, y: 2, z: 0}, color: '#c00'},
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
    const [tiles, setTiles] = useState(defaultTiles)
    const [settings, setSettings] = useState(defaultSettings)

    useEffect(() => {
        let loadAsync = async () => {
            if (!loaded)
            {
                setLoaded(true)

                let tileQuery = await Api.getTiles();
                setTiles(tileQuery)

                let settingsQuery = await Api.getSettings()
                setSettings(settingsQuery)

                Api.connect()
                Api.registerCallback('pattern', message => {
                    setPattern(message.data)
                })
                Api.registerCallback('tileColors', message => {
                    let updatedTiles = { ...tiles }
                    for (var tile of message.tiles) {
                        if (tile.index < updatedTiles.tiles.length) {
                            updatedTiles.tiles[tile.index].color = tile.color
                        }
                    }
                    setTiles(updatedTiles)
                })
            }
        }
        loadAsync()
    }, [loaded, tiles, settings])

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

    return (
        <Router>
            <div className="App">
                <Menu />
                <Switch>
                    <Route exact path="/">
                        <div style={{textAlign: 'center'}}>Current pattern: {pattern}</div>
                        <TileField field={tiles} />
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
