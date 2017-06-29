# Field Data Coordinator App

On start, this project loads an [OSM p2p instance](https://github.com/digidem/osm-p2p-db) and runs an API at `localhost:3210/observations`. Currently, the API supports `/list` and `/create` endpoints. The `/create` endpoint expects a geojson `Feature` object in the payload body.

This project displays observation data in tabular and map data using Mapbox GL.

Internally, data is stored in a Redux store using [Immutable.js](https://facebook.github.io/immutable-js/docs/#/) data structures. On a `SYNC_SUCCESS` action, the Redux store replaces the internally held store with data from OSM p2p. While the store uses a vanilla JS object to hold the raw observation data, this structure should not be used externally; use derivatives objects and `connect` instead.

To interface with the OSM p2p db, the electron app includes a local driver at `src/drivers/`. This driver exposes OSM p2p functionality as promises. This structure will allow us to host a future version by creating a remote driver.

## Development

### Prerequisites

- Node v7.6

### Installation

```
yarn
yarn appdeps
yarn start
```

`.jsx` and `.css` files are hot-swapped.

### Generating mock observations

(The electron app should be running while you do this)

```
cd bin
yarn install
node ./generate-mock-observations.js 10
# generates 10 files in observations folder
ls observations
./upload-mock-observations.sh
```

### Testing

```
yarn lint
yarn test
```
