import {getCanvasContext, sendMessage} from './utils'

const version = 14

self.addEventListener('install', function(event) {
    console.log(`Installing v${version}...`)
    self.skipWaiting()
    event.waitUntil(Promise.resolve(true))
});

self.addEventListener('activate', function(event) {
    console.log(`Activated v${version}`)
    self.clients.claim()

    const context = getCanvasContext()
    console.log(context)
    sendMessage({
        type: context ? 'ready' : 'notsupported'
    })
});

self.addEventListener('message', function(event) {
    console.log(`Message received v${version}`, event.data)
});