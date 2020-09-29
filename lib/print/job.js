import TileQueue, {getTilePriority as tilePriorityFunction} from 'ol/TileQueue'
import {fromLonLat, get as getProj} from 'ol/proj'
import {getForViewAndSize} from 'ol/extent'
import {createLayer} from './layers'
import {createCanvasContext2D} from 'ol/dom'
import {BehaviorSubject, combineLatest, of} from 'rxjs'
import {map, switchMap} from 'rxjs/operators'
import {fromPromise} from 'rxjs/internal-compatibility'
import {isWorker} from '../worker/utils'

/* a job is:
   {
     status: 'printing' | 'ready',
     spec: Object,
     imageData: ImageData,
     progress: 0..1
   }
 */
const jobs = []


export const status$ = new BehaviorSubject({
  jobs
})

export function updateStatus() {
  status$.next({ jobs })
}

export function createJob(spec) {
  const frameState = getFrameState(spec)

  const job = {
    spec,
    status: 'idle',
    imageData: null,
    progress: 0
  }

  jobs.push(job)

  updateStatus()

  const job$ = combineLatest(spec.layers.map(layer => {
    return createLayer(layer, frameState)
  })).pipe(
    switchMap(layerStates => {
      const context = createCanvasContext2D(spec.size[0], spec.size[1])
      const allReady = layerStates.every(([_, canvas]) => !!canvas)

      if (allReady) {
        for (let i = 0; i < layerStates.length; i++) {
          context.drawImage(layerStates[i][1], 0, 0)
        }
        const result$ = isWorker() ?
          of(context.canvas.transferToImageBitmap()) :
          fromPromise(createImageBitmap(context.canvas))
        return result$.pipe(map(bitmap => [1, bitmap]))
      } else {
        const progress =
          layerStates.reduce((prev, [progress, canvas]) => progress + prev, 0) / layerStates.length
        return of([progress, null])
      }
    })
  )

  job$.subscribe(([progress, imageData]) => {
    if (!!imageData) {
      job.status = 'ready'
      job.imageData = imageData
      job.progress = 1
    } else {
      job.status = 'printing'
      job.progress = progress
    }
    updateStatus()
  })
}

function getFrameState(spec) {
  const inchPerMeter = 39.3701
  const resolution = spec.scale / spec.dpi / inchPerMeter;

  const projection = getProj(spec.projection)

  const viewState = {
    center: fromLonLat(spec.center, projection),
    resolution,
    projection,
    rotation: 0
  }

  const frameState = {
    animate: false,
    coordinateToPixelTransform: [1, 0, 0, 1, 0, 0],
    declutterItems: [],
    extent: getForViewAndSize(
        viewState.center,
        viewState.resolution,
        viewState.rotation,
        spec.size
    ),
    index: 0,
    layerIndex: 0,
    layerStatesArray: [],
    pixelRatio: 1,
    pixelToCoordinateTransform: [1, 0, 0, 1, 0, 0],
    postRenderFunctions: [],
    size: spec.size,
    time: Date.now(),
    usedTiles: {},
    viewState: viewState,
    viewHints: [0, 0],
    wantedTiles: {},
  };

  frameState.tileQueue = new TileQueue(
    (tile, tileSourceKey, tileCenter, tileResolution) =>
      tilePriorityFunction(
        frameState,
        tile,
        tileSourceKey,
        tileCenter,
        tileResolution
      ),
    () => {})
  frameState.viewState.projection = getProj('EPSG:3857')
  return frameState
}


