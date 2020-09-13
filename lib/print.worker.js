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

function sendMessage(message) {
    self.clients.matchAll({
        type: 'window',
    }).then((clients) => {
        if (clients && clients.length) {
            // Send a response - the clients
            // array is ordered by last focused
            clients[0].postMessage(message)
        }
    });
}