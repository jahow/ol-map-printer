import TileQueue, {getTilePriority as tilePriorityFunction} from 'ol/TileQueue'
import { get as getProj } from 'ol/proj'
import { getForViewAndSize } from 'ol/extent';
import { fromLonLat } from 'ol/proj';

/* a job is:
   {
     status: 'printing' | 'ready',
     spec: Object
   }
 */
import {createLayer} from './layers'
import Projection from 'ol/proj/Projection'

const jobs = []


export function createJob(spec) {
  jobs.push({
    spec,
    status: 'printing'
  })

  const layer = createLayer(spec.layers[0], spec.size[0], spec.size[1], getFrameState(spec))
  layer.then(() => console.log('layer loaded'))

  return layer
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


