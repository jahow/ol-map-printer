window.addEventListener('load', () => {
    const specElt = document.getElementById('spec')
    const printBtn = document.getElementById('print')

    printBtn.disabled = true

    printBtn.addEventListener('click', () => {
        navigator.serviceWorker.controller.postMessage({
            type: "request",
            spec: JSON.parse(specElt.value)
        })
    })

    navigator.serviceWorker.onmessage = function (event) {
        const msg = event.data
        console.log(msg)
        switch (msg.type) {
            case 'ready':
                console.log('Worker is ready')
                printBtn.disabled = false
                break;
        }
    }

    navigator.serviceWorker.register('worker.js').then(
        registration => {
            console.log('Service worker registration:', registration)
            printBtn.disabled = false
            registration.addEventListener('updatefound', () => {
                console.log('A service worker update was found')
                printBtn.disabled = true
            })
        },
        error => {
            console.log('Service worker registration failed:', error)
        }
    )
})
