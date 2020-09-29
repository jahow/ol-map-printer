import {BehaviorSubject} from 'rxjs'
import {createJob, status$} from './print/job'

if (navigator.serviceWorker.controller) {
  console.log(`This page is currently controlled by: ${navigator.serviceWorker.controller}`);
} else {
  console.log('This page is not currently controlled by a service worker.');
}


export const jobs$ = new BehaviorSubject([])
export const printStatus$ = new BehaviorSubject(false)

let useWorker = null
function init(withWorker) {
  useWorker = withWorker
  printStatus$.next(true)
  status$.subscribe(status => jobs$.next(status.jobs))
}

export function startPrint(spec) {
  if (useWorker) {
    navigator.serviceWorker.controller.postMessage({
      type: "request",
      spec
    })
  } else {
    createJob(spec)
  }
}
navigator.serviceWorker.onmessage = function (event) {
  const msg = event.data
  console.log('Message received by main thread', msg)
  switch (msg.type) {
    case 'notsupported':
      console.log('OffscreenCanvas not supported :(')
      init(false)
      break;
    case 'status':
      jobs$.next(msg.status.jobs)
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
    init(false)
  }
)

navigator.serviceWorker.ready.then(() => {
  console.log('Service worker ready')
  init(true)

  navigator.serviceWorker.controller.postMessage({
    type: "report"
  })
})
