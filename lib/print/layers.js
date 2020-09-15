import TileLayer from 'ol/layer/Tile'
import {getCanvasContext} from '../worker/utils'
import XYZ from 'ol/source/XYZ'
import ImageWMS from 'ol/source/ImageWMS'
import ImageLayer from 'ol/layer/Image'

export function createLayer(layerSpec, rootFrameState) {
  switch (layerSpec.type) {
    case 'XYZ': return createLayerXYZ(layerSpec, rootFrameState)
    case 'WMS': return createLayerWMS(layerSpec, rootFrameState)
  }
}

function createLayerXYZ(layerSpec, rootFrameState) {
  return new Promise(resolve => {
    const width = rootFrameState.size[0]
    const height = rootFrameState.size[1]
    const context = getCanvasContext(width, height)
    let frameState
    let layer
    let renderer

    layer = new TileLayer({
      transition: 0,
      source: new XYZ({
        crossOrigin: 'anonymous',
        url: layerSpec.url,
        transition: 0
      })
    })
    layer.getSource().setTileLoadFunction(
        function (tile, src) {
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
  })
}

function createLayerWMS(layerSpec, rootFrameState) {
  return new Promise(resolve => {
    const width = rootFrameState.size[0]
    const height = rootFrameState.size[1]
    const context = getCanvasContext(width, height)
    let frameState
    let layer
    let renderer

    layer = new ImageLayer({
      transition: 0,
      source: new ImageWMS({
        crossOrigin: 'anonymous',
        url: layerSpec.url,
        params: { LAYERS: layerSpec.layer }
      })
    })
    layer.getSource().setImageLoadFunction(
        function (image, src) {
          const layerImage = image
          console.log(layerImage, src)
          fetch(src)
              .then(response => response.blob())
              .then(blob => {
                const image = layerImage.getImage()
                image.setSize(width, height)
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

    layer.getSource().once('imageloadend', () => {
      renderer.prepareFrame({...frameState, time: Date.now()})
      renderer.renderFrame({...frameState, time: Date.now()}, context.canvas)
      resolve(context.canvas)
    })
    renderer.prepareFrame({...frameState, time: Date.now()})
  })
}
