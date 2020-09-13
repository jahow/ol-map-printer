export function sendMessage(message) {
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
