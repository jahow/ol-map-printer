# Print map using OpenLayers

This is an experimental project which showcases how large/high definition maps can be rendered on the
browser using [OpenLayers](https://www.openlayers.org) and [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API).

Live demo here: https://jahow.github.io/ol-map-printer/

## Introduction

A spec is given to the worker which then prints the layers and return an image bitmap to the main thread.

Currently this bitmap is rendered in a canvas element, but it can be downloaded automatically or added
in a PDF document for instance.

**Note: this will NOT work on Firefox as OffscreenCanvas is not supported yet for 2D operations on this browser.**
Eventually a fallback will be done to print the maps on the main thread if doing it on a worker is not an option. 

## Features

* List all jobs with status (printing/complete, progress)
* Using a service worker means the user can close the tab and come back, and still see its pending jobs (which are still going on during that time)
* No hard limit on size of the map
* Support for XYZ and WMS layers
* Shows fine grained progress on tiled layers (not yet on full image layers like WMS)

## Limitations

* No fallback on main thread
* Weird cropping on WMS layers
* No support for other projections
* No support for client-side styles (for WFS, GeoJSON, KML, Vector Tiles...)
* No clean API for interacting with the worker
* Probably many memory leaks due to reckless observable use

Note that all these limitations *can* be overcome. :godmode:
