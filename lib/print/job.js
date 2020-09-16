import TileQueue, {getTilePriority as tilePriorityFunction} from 'ol/TileQueue'
import {fromLonLat, get as getProj} from 'ol/proj'
import {getForViewAndSize} from 'ol/extent'
import {createLayer} from './layers'
import {createCanvasContext2D} from 'ol/dom'
import {combineLatest} from 'rxjs'
import {map} from 'rxjs/operators'

/* a job is:
   {
     status: 'printing' | 'ready',
     spec: Object
   }
 */

const jobs = []


export function createJob(spec) {
  jobs.push({
    spec,
    status: 'printing'
  })

  const frameState = getFrameState(spec)

  return combineLatest(spec.layers.map(layer => {
    return createLayer(layer, frameState)
  })).pipe(
    map(layerImages => {
      const context = createCanvasContext2D(spec.size[0], spec.size[1])
      for (let i = 0; i < layerImages.length; i++) {
        context.drawImage(layerImages[i], 0, 0)
      }
      return context.canvas
    })
  )
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


