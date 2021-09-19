import React from 'react';
import * as Api from './api'

let ConnectionStatus = props => {

    let icon = '⭕'
    switch (props.state) {
        case 'connected':
            icon = '🟢'
            break
        case 'connecting':
            icon = '⚫'
            break
        case 'disconnected':
        default:
            icon = '⭕'
            break
    }

    let onClick = (_e) => {
        if (props.state === 'disconnected') {
            Api.connect()
        }
    }

    return (
        <div className='connectionStatus'>
            <div onClick={onClick}>{icon}</div>
        </div>
    )
}

export default ConnectionStatus