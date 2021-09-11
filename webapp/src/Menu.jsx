import React from 'react'
import {
  Link,
  Switch,
  Route
} from "react-router-dom"
import './styles.css'

let Menu = props => {
  return (
    <nav className="nav nav-pills" style={{minHeight: props.height + 'px'}}>
      <Link className="navbar-brand" to="/">Picotile</Link>
      <Switch>
        <Route exact path="/">
          <Link className="nav-link active" aria-current="page" to="/">Live</Link>
          <Link className="nav-link" to="settings">Settings</Link>
        </Route>
        <Route exact path="/settings">
          <Link className="nav-link" to="/">Live</Link>
          <Link className="nav-link active" aria-current="page" to="settings">Settings</Link>
        </Route>
      </Switch>
    </nav>
  )
}

export default Menu

  