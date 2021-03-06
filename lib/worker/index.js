import {sendMessage} from './utils'
import {createJob, status$, updateStatus} from '../print/job'
import {createCanvasContext2D} from 'ol/dom'

const version = 18

class Image extends OffscreenCanvas {
    constructor() {
        super(1, 1)
        this.setSize(1, 1)
        this.loadPromiseResolver = null
        this.loadPromise = new Promise(resolve => this.loadPromiseResolver = resolve)
    }
    setSize(width, height) {
        this.width = width
        this.height = height
        this.naturalWidth = width
        this.naturalHeight = height
    }
    addEventListener(eventName, callback) {
        if (eventName === 'load') {
            this.loadPromise.then(callback)
        }
    }
    removeEventListener() {}
    loaded() {
        this.loadPromiseResolver()
    }
}
self.Image = Image

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
        if (!createCanvasContext2D(1, 1)) {
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
    const msg = event.data
    console.log(`Message received by worker (v${version})`, msg)
    switch (msg.type) {
        case 'request':
            createJob(msg.spec)
            break
        case 'report':
            updateStatus()
            break
    }
});

status$.subscribe(status => {
    // send status with all jobs and transferable image data
    sendMessage({
        type: 'status',
        status
    },
      status.jobs
        .filter(job => !!job.imageData)
        .map(job => job.imageData)
    )
})
