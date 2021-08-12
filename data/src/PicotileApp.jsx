import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
  } from "react-router-dom";
  
import './styles.css';

import Menu from './Menu'
import Settings from './Settings'
import TileField from './TileField';

const tiles = [
    {type: 'control', pos: {x: 4, y: 5, z: 1}}, 
    {type: 'light', index: 0, pos: {x: 4, y: 4, z: 0}, color: '#b0b'},
    {type: 'light', index: 0, pos: {x: 3, y: 4, z: 1}, color: '#4B0082'},
    {type: 'light', index: 0, pos: {x: 3, y: 3, z: 0}, color: '#00c'},
    {type: 'light', index: 0, pos: {x: 3, y: 3, z: 1}, color: '#0d0'},
    {type: 'light', index: 0, pos: {x: 3, y: 2, z: 0}, color: '#dd0'},
    {type: 'light', index: 0, pos: {x: 2, y: 2, z: 1}, color: '#d70'},
    {type: 'light', index: 0, pos: {x: 2, y: 2, z: 0}, color: '#c00'},
  ];

let PicotileApp = props => {
    return (
        <Router>
            <div className="App">
                <Menu />
                <Switch>
                    <Route exact path="/">
                        <TileField field={tiles} />
                    </Route>
                    <Route exact path="/settings">
                        <Settings />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

export default PicotileApp;
