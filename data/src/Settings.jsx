import React from 'react';

import './styles.css';

let Settings = props => {
    return (
        <div id="settings">
            <div className="form-group mb-3 row">
                <div className="col-sm-2"></div>
                    <div className="col-sm-8">
            
                        <label className="form-label">Wifi settings</label>
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
                        </div>
            
                        <div className="form-group mb-3 row">
                            <label className="col-sm-2 control-label" htmlFor="sensorSwitch">On/Off</label>
                            <div className="col-sm-1 form-switch">
                            <input className="form-check-input" type="checkbox" id="sensorSwitch" checked />
                            </div>
                        </div>

                        <div className="form-group mb-3 row">
                            <label className="col-sm-2 control-label" htmlFor="sensorSwitch">Capacitive sensor</label>
                            <div className="col-sm-1 form-switch">
                            <input className="form-check-input" type="checkbox" id="sensorSwitch" checked />
                            </div>
                        </div>

                        <div className="form-group mb-3 row">
                            <label className="col-sm-2 control-label">Brightness</label>
                            <div className="col-sm-2">
                            <input className="form-control input" type="number" step="1" min="0" max="255" value="128" />
                            </div>
                            <div className="col-sm-8">
                            <input className="form-range" type="range" step="1" min="0" max="255" value="128" />
                            </div>
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

                        {
                        //<!-- TODO: Convert these to canvases with gradients -->
                        }
                        <div className="form-group mb-3 row">
                            <label className="col-sm-2 control-label color-label">Included palettes</label>
                            <div className="col-sm-8">
                                <p>
                                    <input className="form-check-input" type="checkbox" id="coolPalette" checked />
                                    <label className="form-check-label" htmlFor="coolPalette">
                                        <button type="button" className="btn btn-color" style={{background: "#0080FF"}} title="Azure">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#0000FF"}} title="Blue">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#8000FF"}} title="Violet">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#FFFFFF"}} title="White">&nbsp;</button>
                                    </label>
                                </p>
                                <p>
                                    <input className="form-check-input" type="checkbox" id="warmPalette" checked />
                                    <label className="form-check-label" htmlFor="warmPalette">
                                        <button type="button" className="btn btn-color" style={{background: "#FF0000"}} title="Red">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#FF8000"}} title="Orange">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#FFFF00"}} title="Yellow">&nbsp;</button>          
                                        <button type="button" className="btn btn-color" style={{background: "#FFFFFF"}} title="White">&nbsp;</button>
                                    </label>
                                </p>
                                <p>
                                    <input className="form-check-input" type="checkbox" id="pridePalette" checked />
                                    <label className="form-check-label" htmlFor="pridePalette">
                                        <button type="button" className="btn btn-color" style={{background: "#FF0000"}} title="Red">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#FF8000"}} title="Orange">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#FFFF00"}} title="Yellow">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#00FF00"}} title="Green">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#0080FF"}} title="Azure">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#0000FF"}} title="Blue">&nbsp;</button>
                                        <button type="button" className="btn btn-color" style={{background: "#8000FF"}} title="Violet">&nbsp;</button>
                                    </label>
                                </p>

                            </div>

                            <div className="form-group mb-3 row">    
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
                
                    </div>
                    <div className="col-sm-2"></div>
                </div>
            </div>
        </div>
    );
}

export default Settings;
