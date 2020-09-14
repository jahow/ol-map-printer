window.addEventListener('load', () => {
    const specElt = document.getElementById('spec')
    const printBtn = document.getElementById('print')

    printBtn.disabled = true

    if (navigator.serviceWorker.controller) {
        console.log(`This page is currently controlled by: ${navigator.serviceWorker.controller}`);
    } else {
        console.log('This page is not currently controlled by a service worker.');
    }

    printBtn.addEventListener('click', () => {
        navigator.serviceWorker.controller.postMessage({
            type: "request",
            spec: JSON.parse(specElt.value)
        })
    })

    navigator.serviceWorker.onmessage = function (event) {
        const msg = event.data
        console.log('Message received by main thread', msg)
        switch (msg.type) {
            case 'notsupported':
                console.log('OffscreenCanvas not supported :(')
                break;
        }
    }

    navigator.serviceWorker.register('worker.js').then(
        registration => {

            if(registration.installing) {
                console.log('Service worker installing');
            } else if(registration.waiting) {
                console.log('Service worker installed');
            } else if(registration.active) {
                console.log('Service worker active');
            }

            console.log('Service worker registration:', registration)
            registration.addEventListener('updatefound', () => {
                console.log('A service worker update was found')
            })
        },
        error => {
            console.log('Service worker registration failed:', error)
        }
    )

    navigator.serviceWorker.ready.then(() => {
        console.log('Service worker ready')
        printBtn.disabled = false
    })
})
