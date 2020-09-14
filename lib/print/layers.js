import OSM from 'ol/source/OSM'
import TileLayer from 'ol/layer/Tile'
import {getCanvasContext} from '../worker/utils'

export function createLayer(layerSpec, width, height, rootFrameState) {
  return new Promise(resolve => {
    const context = getCanvasContext(width, height)
    let frameState
    let layer
    let renderer

    switch (layerSpec.type) {
      case "OSM":
        layer = new TileLayer({
          source: new OSM()
        })

        const frameState = {
          ...rootFrameState,
          layerStatesArray: [{
            layer,
            managed: true,
            maxResolution: null,
            maxZoom: null,
            minResolution: 0,
            minZoom: null,
            opacity: 1,
            sourceState: "ready",
            visible: true,
            zIndex: 0
          }]
        }

        renderer = layer.getRenderer()
        renderer.useContainer = function (target, transform) {
          this.containerReused = false;
          this.canvas = context.canvas;
          this.context = context;
          this.container = {
            firstElementChild: context.canvas,
          };
        };

        function checkTilesLoading() {
          renderer.renderFrame(frameState, context.canvas);
          frameState.tileQueue.reprioritize();
          frameState.tileQueue.loadMoreTiles(8, 2);

          if (!frameState.tileQueue.getTilesLoading()) {
            resolve(context.canvas)
          } else {
            setTimeout(checkTilesLoading, 100)
          }
        }
        checkTilesLoading()
    }
  })
}
