import React, { useEffect, useRef, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
  } from "react-router-dom";
  
import './styles.css';

import * as Api from './api'
import ConnectionStatus from './ConnectionStatus';
import Live from './Live'
import Menu from './Menu'
import Settings from './Settings'

const defaultSettings = {
    onOff: true,
    brightness: 128,
    speed: 128,
    mode: 'automatic'
}

let PicotileApp = props => {

    const loaded = useRef(false)
    const [connected, setConnected] = useState(null)
    const [settings, setSettings] = useState(defaultSettings)

    useEffect(() => {
        let loadAsync = async () => {
            if (!loaded.current) {
                loaded.current = true

                try {
                    let settingsQuery = await Api.getSettings()
                    setSettings(settingsQuery)
                } catch { }
                
                Api.registerConnectionCallback((state) => {
                    setConnected(state)
                })
                Api.connect()
            }
        }
        loadAsync()
        return () => {/* TODO: Cleanup! */}
    }, [loaded, settings])

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

    let onSwitchLedMode = async (mode) => {
        let updatedSettings = {
            ...settings,
            mode
        }
        setSettings(updatedSettings)
        await Api.postSettings(updatedSettings)
    }

    const windowWidth = document.documentElement.clientWidth
    const windowHeight = document.documentElement.clientHeight

    const menuHeight = 61
    const liveHeight = windowHeight - menuHeight

    return (
        <Router>
            <div className="App">
                <ConnectionStatus state={connected} height={menuHeight} />
                <Menu height={menuHeight} />
                <Switch>
                    <Route exact path="/">
                        <Live width={windowWidth} height={liveHeight} mode={settings.mode} setMode={onSwitchLedMode} />
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
