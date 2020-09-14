import {getCanvasContext, sendMessage} from './utils'

const version = 18

self.addEventListener('install', function(event) {
    console.log(`Installing worker (v${version})...`)

    self.skipWaiting().then(() => {
        console.log(`Installed worker (v${version})`)
    })
});

self.addEventListener('activate', function(event) {
    console.log(`Activated worker (v${version})`)

    console.log(`Testing canvas in worker (v${version}...)`)
    try {
        if (!getCanvasContext(1, 1)) {
            throw new Error()
        }
    } catch {
        sendMessage({
            type: 'notsupported'
        })
    }

    self.clients.claim()
});

self.addEventListener('message', function(event) {
    console.log(`Message received by worker (v${version})`, event.data)
});
