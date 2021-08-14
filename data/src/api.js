const API_PORT = 80
const baseUrl = () => 
    `${window.location.protocol}//${window.location.hostname}:${API_PORT}`

export const getSettings = async () => {
    var url = new URL(`${baseUrl()}/settings`)
    const response = await fetch(url, {
        method: 'GET'
    });
    return await response.json();
}

export const postSettings = async (settings) => {
    var url = new URL(`${baseUrl()}/settings`)
    url.search = new URLSearchParams(settings).toString()
    const response = await fetch(url, {
        method: 'POST'
    });
    return await response.json();
}

export const getTiles = async () => {
    var url = new URL(`${baseUrl()}/tiles`)
    const response = await fetch(url, {
      method: 'GET'
    });
    return await response.json();
}

export const addTile = async (x, y, z, type) => {
    var url = new URL(`${baseUrl()}/tiles/add`)
    url.search = new URLSearchParams({x, y, z, type}).toString()
    const response = await fetch(url, {
      method: 'POST'
    })
    if (response.status != 201) {
        console.log("ERROR! " + response.status)
    }
}
  