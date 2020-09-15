import {getCanvasContext, sendMessage} from './utils'
import {createJob} from '../print/job'

const version = 18

class Image extends OffscreenCanvas {
    constructor() {
        super(1, 1)
        this.width = 1
        this.height = 1
        this.naturalWidth = 1
        this.naturalHeight = 1
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
// self.Image = function() {
//     this.width = 10;
//     this.height = 10;
//     //return createImageBitmap()
//     this.loadPromiseResolver = null
//     this.loadPromise = new Promise(resolve => this.loadPromiseResolver = resolve)
//     this.addEventListener = function(eventName, callback) {
//         this.loadPromise.then(callback)
//     }
//     this.removeEventListener = function() {}
//     this.loaded = function() {
//         this.loadPromiseResolver()
//     }
//     this.getContext = function() {
//         return getCanvasContext(10, 10)
//     }
// }

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
    const msg = event.data
    console.log(`Message received by worker (v${version})`, msg)
    switch (msg.type) {
        case 'request':
            createJob(msg.spec).then(canvas => {
                const imageData = canvas.transferToImageBitmap()
                sendMessage({
                    type: 'render',
                    imageData
                }, [imageData])
            })
            break
    }
});
