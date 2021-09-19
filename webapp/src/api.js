const HTTP_PORT = 80
const WS_PORT = 81
const baseUrl = () => 
    `${window.location.protocol}//${window.location.hostname}:${HTTP_PORT}`
const wsBaseUrl = () => 
    `ws://${window.location.hostname}:${WS_PORT}`

const maxReconnectAttempts = 1

let webSocket
let eventCallbacks = []
let connectionCallback

export const getSettings = async () => {
    var url = new URL(`${baseUrl()}/settings`)
    const response = await fetch(url, {
        method: 'GET'
    })
    return await response.json();
}

export const postSettings = async (settings) => {
    var url = new URL(`${baseUrl()}/settings`)
    url.search = new URLSearchParams(settings).toString()
    const response = await fetch(url, {
        method: 'POST'
    })
    return await response.json();
}

export const getTiles = async () => {
    var url = new URL(`${baseUrl()}/tiles`)
    const response = await fetch(url, {
      method: 'GET'
    })
    return await response.json();
}

export const addTile = async (index, x, y, z, type) => {
    var url = new URL(`${baseUrl()}/tiles/add`)
    url.search = new URLSearchParams({index, x, y, z, type}).toString()
    const response = await fetch(url, {
      method: 'POST'
    })
    if (response.status !== 201) {
        console.log("ERROR! " + response.status)
    }
}

export const removeTile = async (index) => {
    var url = new URL(`${baseUrl()}/tiles/delete`)
    url.search = new URLSearchParams({index}).toString()
    const response = await fetch(url, {
      method: 'POST'
    })
    if (response.status !== 200) {
        console.log("ERROR! " + response.status)
    }
}

export const state = () => {
    switch (webSocket?.readyState) {
        case WebSocket.OPEN:
            return 'connected'
        case WebSocket.CONNECTING:
            return 'connecting'
        case WebSocket.CLOSED:
        case WebSocket.CLOSING:
        default:
            return 'disconnected'
    }
}

let reconnectAttemptsLeft = maxReconnectAttempts

export const connect = () => {
    console.log(`Connecting to WS ${wsBaseUrl()}`)
    webSocket = new WebSocket(wsBaseUrl())

    if (connectionCallback) {
        connectionCallback(state())
    }

    webSocket.onopen = (_openEvent) => {
        console.log('WS connected')
        if (connectionCallback) {
            connectionCallback(state())
        }
        reconnectAttemptsLeft = maxReconnectAttempts
    }

    webSocket.onerror = (_errorEvent) => {
        console.log('WS error')
        if (connectionCallback) {
            connectionCallback(state())
        }
    }

    webSocket.onclose = (_closeEvent) => {
        console.log(`WS disconnected`)
        if (connectionCallback) {
            connectionCallback(state())
        }

        if (reconnectAttemptsLeft > 0) {
            reconnectAttemptsLeft--
            console.log(`Reconnecting. Attempts left: ${reconnectAttemptsLeft}`)
            connect()
        }
    }

    webSocket.onmessage = (event) => {
        let message = JSON.parse(event.data)
        
        // console.log(`Received message of type ${message.type}`)
        // console.log(message)
        if (message.type in eventCallbacks) {
            eventCallbacks[message.type](message)
        }
    };
}

export const registerConnectionCallback = (callback) => {
    connectionCallback = callback
}

export const registerCallback = (eventType, callback) => {
    eventCallbacks[eventType] = callback
}

export const unregisterCallback = (eventType) => {
    eventCallbacks[eventType] = null
}

export const sendSetTile = (index, color) => {
    const message = {
        type: 'setTile',
        index,
        color,
    }
    webSocket.send(JSON.stringify(message))
}

export const sendSetPattern = (pattern) => {
    const message = {
        type: 'setPattern',
        pattern,
    }
    webSocket.send(JSON.stringify(message))
}
