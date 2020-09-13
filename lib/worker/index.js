import { sendMessage } from './utils'

const version = 11

self.addEventListener('install', function(event) {
    console.log(`Installing v${version}...`)
    self.skipWaiting()
    event.waitUntil(Promise.resolve(true))
});

self.addEventListener('activate', function(event) {
    console.log(`Activated v${version}`)
    self.clients.claim()
    sendMessage({
        type: 'ready'
    })
});

self.addEventListener('message', function(event) {
    console.log(`Message received v${version}`, event.data)
});