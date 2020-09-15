import TileQueue, {getTilePriority as tilePriorityFunction} from 'ol/TileQueue'
import { get as getProj } from 'ol/proj'

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
  const frameState = {
    'animate': false,
    'coordinateToPixelTransform': [0.00004727231254352931, 0, 0, -0.00004727231254352931, 653.8153114578557, 200.2902847949541],
    'declutterItems': [],
    'extent': [-13830829.851105956, -4224665.654364785, 13902105.760893231, 4236947.041897362],
    'index': 41,
    'layerIndex': 0,
    'layerStatesArray': [{}],
    'pixelRatio': 1,
    'pixelToCoordinateTransform': [21154.03174065537, 0, 0, -21154.03174065537, -13830829.851105956, 4236947.041897362],
    'postRenderFunctions': [],
    'size': spec.size,
    'tileQueue': null,
    'time': 1600073730302,
    'usedTiles': {},
    'viewState': {
      'center': [35637.95489363745, 6140.693766288343],
      'projection': {
        'code_': 'EPSG:3857',
        'units_': 'm',
        'extent_': [-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244],
        'worldExtent_': [-180, -85, 180, 85],
        'axisOrientation_': 'enu',
        'global_': true,
        'canWrapX_': true,
        'defaultTileGrid_': null
      },
      'resolution': 21154.03174065537,
      'rotation': 0,
      'zoom': 2.8875547533481325
    },
    'viewHints': [1, 0],
    'wantedTiles': {'4': {}}
  }
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


