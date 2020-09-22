window.addEventListener('load', () => {
    const specElt = document.getElementById('spec')
    const printBtn = document.getElementById('print')
    const statusElt = document.getElementById('status')

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
            case 'status':
                const jobs = msg.status.jobs
                statusElt.innerHTML = `
Worker is operational. Jobs:<br>
<ul>
  ${jobs.map(job =>
    `<li>status: ${job.status} - progress: ${(job.progress * 100).toFixed(0)}% <canvas style="width: 200px"></canvas></li>`
  ).join('')}
  ${jobs.length === 0 ? 'No job found.' : ''}
</ul>`
                jobs
                  .filter(job => !!job.imageData)
                  .forEach((job, index) => {
                    const canvas = statusElt.querySelectorAll('li > canvas')[index]
                    const ctx = canvas.getContext('2d')
                    canvas.width = job.imageData.width;
                    canvas.height = job.imageData.height;
                    ctx.drawImage(job.imageData, 0, 0)
                })
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

        navigator.serviceWorker.controller.postMessage({
            type: "report"
        })
    })
})
