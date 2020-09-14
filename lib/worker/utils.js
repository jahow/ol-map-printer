export function sendMessage(message) {
    console.log('Sending message', message)
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

export function getCanvasContext(width, height) {
    const canvas = new OffscreenCanvas(width, height)
    return canvas.getContext('2d')
}
