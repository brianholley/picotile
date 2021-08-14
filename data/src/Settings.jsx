import React, { useEffect, useRef } from 'react'

import './styles.css'

let Settings = props => {
    let { onChangeSetting, settings } = props
    let { onOff, brightness, speed, mode } = settings
    
    let onChangeOnOff = (e) => {
        settings = {
            ...settings,
            onOff: e.target.checked
        }
        onChangeSetting(settings)
    }

    let onChangeBrightness = (e) => {
        settings = {
            ...settings,
            brightness: e.target.value
        }
        onChangeSetting(settings)
    }

    let onChangeSpeed = (e) => {
        settings = {
            ...settings,
            speed: e.target.value
        }
        onChangeSetting(settings)
    }

    return (
        <div id="settings">
            <div className="form-group mb-3 row">
                <div className="col-sm-2"></div>
                <div className="col-sm-8">
        
                    {/* <label className="form-label">Wifi settings</label>
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="ssid-label">Network SSID</span>
                        <input type="text" className="form-control" id="ssid" />
                    </div>
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="password-label">Password</span>
                        <input type="password" className="form-control" id="password" />
                    </div>
        
                    <div className="form-group mb-3 row">    
                        <hr />
                    </div>
                    
                    <div className="form-group mb-3 row">    
                        <label className="form-label col-sm-11">Tile settings</label>
                    </div> */}
        
                    <div className="form-group mb-3 row">
                        <label className="col-sm-2 control-label" htmlFor="sensorSwitch">On/Off</label>
                        <div className="col-sm-1 form-switch">
                            <input className="form-check-input" type="checkbox" id="sensorSwitch" checked={onOff} onChange={onChangeOnOff} />
                        </div>
                    </div>

                    {/* <div className="form-group mb-3 row">
                        <label className="col-sm-2 control-label" htmlFor="sensorSwitch">Capacitive sensor</label>
                        <div className="col-sm-1 form-switch">
                            <input className="form-check-input" type="checkbox" id="sensorSwitch" checked />
                        </div>
                    </div> */}

                    <div className="form-group mb-3 row">
                        <label className="col-sm-2 control-label">Brightness</label>
                        <div className="col-sm-1"></div>
                        <div className="col-sm-7">
                            <input className="form-range" type="range" step="1" min="0" max="255" value={brightness} onChange={onChangeBrightness} />
                        </div>
                        <div className="col-sm-2">
                            <input className="form-control input" type="number" step="1" min="0" max="255" value={brightness} onChange={onChangeBrightness} />
                        </div>
                    </div>

                    <div className="form-group mb-3 row">
                        <label className="col-sm-2 control-label">Speed</label>
                        <div className="col-sm-1">Slow</div>
                        <div className="col-sm-7">
                            <input className="form-range" type="range" step="1" min="0" max="255" value={speed} onChange={onChangeSpeed} />
                        </div>
                        <div className="col-sm-2">Fast</div>
                    </div>

                    <div className="form-group mb-3 row">
                        <label className="col-sm-2 control-label">Mode</label>
                        <div className="col-sm-10">
                            <select className="form-select">
                                <option>Manual</option>
                                <option>Solid color</option>
                                <option>Chasing lights</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group mb-3 row">
                        <label className="col-sm-2 control-label color-label">Included palettes</label>
                        <div className="col-sm-8">
                            <Palette paletteId="cool" enabled={true} width="300" height="40" colors={["#0080FF", "#0000FF", "#8000FF", "#FFFFFF"]} />
                            <Palette paletteId="warm" enabled={true} width="300" height="40" colors={["#FF0000", "#FF8000", "#FFFF00", "#FFFFFF"]} />
                            <Palette paletteId="pride" enabled={true} width="300" height="40" colors={["#FF0000", "#FF8000", "#FFFF00", "#00FF00", "#0080FF", "#0000FF", "#8000FF"]} />
                        </div>
                    </div> 

                    {/* <div className="form-group mb-3 row">    
                        <hr />
                    </div> 
                
                    <div className="form-group mb-3 row">    
                        <label className="form-label col-sm-11">Site settings</label>
                    </div>
                        
                    <div className="form-group mb-3 row">
                        <label className="col-sm-2 control-label" htmlFor="sensorSwitch">Dark Mode</label>
                        <div className="col-sm-1 form-switch">
                            <input className="form-check-input" type="checkbox" id="sensorSwitch" />
                        </div>
                    </div>
                    <div className="col-sm-2"></div> */}
                </div>
            </div>
        </div>
    );
}

let Palette = props => {

    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        var ctx = canvas.getContext("2d")

        var gradient = ctx.createLinearGradient(0, 0, props.width, 0)

        var offset = 0
        var step = 1 / (props.colors.length - 1)
        for (var color of props.colors) {
            gradient.addColorStop(offset, color)
            offset += step
        }
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, props.width, props.height)
    }, [props.width, props.height, props.colors])

    return (
        <p>
            <input className="form-check-input" type="checkbox" id={props.paletteId} checked={props.enabled} />
            <canvas ref={canvasRef} width={props.width} height={props.height}/>
        </p>
    )
}

export default Settings
