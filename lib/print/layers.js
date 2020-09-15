import TileLayer from 'ol/layer/Tile'
import {getCanvasContext} from '../worker/utils'
import XYZ from 'ol/source/XYZ'

export function createLayer(layerSpec, rootFrameState) {
  return new Promise(resolve => {
    const width = rootFrameState.size[0]
    const height = rootFrameState.size[1]
    const context = getCanvasContext(width, height)
    let frameState
    let layer
    let renderer

    switch (layerSpec.type) {
      case 'XYZ':
        layer = new TileLayer({
          transition: 0,
          source: new XYZ({
            crossOrigin: 'anonymous',
            url: layerSpec.url,
            transition: 0
          })
        })
        layer.getSource().setTileLoadFunction(
          function(tile, src) {
            fetch(src)
              .then(response => response.blob())
              .then(blob => {
                const image = tile.getImage()
                const tileSize = layer.getSource().getTilePixelSize(0,
                    rootFrameState.pixelRatio,
                    rootFrameState.viewState.projection
                );
                image.setSize(tileSize[0], tileSize[1])
                const ctx = image.getContext('2d')
                createImageBitmap(blob).then(imageData => {
                  ctx.drawImage(imageData, 0, 0)
                  image.loaded()
                })
              })
          })

        frameState = {
          ...rootFrameState,
          layerStatesArray: [{
            layer,
            managed: true,
            maxResolution: null,
            maxZoom: null,
            minResolution: 0,
            minZoom: null,
            opacity: layerSpec.opacity !== undefined ? layerSpec.opacity : 1,
            sourceState: 'ready',
            visible: true,
            zIndex: 0
          }]
        }

        renderer = layer.getRenderer()
        renderer.useContainer = function (target, transform) {
          this.containerReused = false
          this.canvas = context.canvas
          this.context = context
          this.container = {
            firstElementChild: context.canvas,
          }
        }

        function checkTilesLoading() {
          renderer.renderFrame({...frameState, time: Date.now()}, context.canvas)
          frameState.tileQueue.reprioritize()
          frameState.tileQueue.loadMoreTiles(8, 2)

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
