const { ipcRenderer } = window.require('electron')
const React = require('react')
const ReactDOM = require('react-dom')
const { createStore, applyMiddleware, compose } = require('redux')
const { Provider } = require('react-redux')
const createSagaMiddleware = require('redux-saga').default
const { HashRouter, Route, Redirect } = require('react-router-dom')
const persistState = require('redux-localstorage')

const reducers = require('./reducers')
const { rootSaga } = require('./sagas')
const { sync } = require('./actions')

const App = require('./ui/app/index.jsx')
const Home = require('./ui/home/index.jsx')
const Data = require('./ui/data/index.jsx')
const Observation = require('./ui/data/Observation.jsx')
const Surveys = require('./ui/surveys/index.jsx')
const About = require('./ui/about/index.jsx')

const sagaMiddleware = createSagaMiddleware()
const localstorageMiddleware = persistState('osmBounds')
const store = createStore(reducers, compose(
  applyMiddleware(sagaMiddleware),
  localstorageMiddleware
))
sagaMiddleware.run(rootSaga)
store.dispatch(sync())

// register a dispatch listener so that actions can be sent between processes
ipcRenderer.on('dispatch', (evt, payload) => store.dispatch(payload))
ipcRenderer.send('redux-initialized')

const mapboxgl = require('mapbox-gl')
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwZWd5cHQiLCJhIjoiY2l6ZTk5YTNxMjV3czMzdGU5ZXNhNzdraSJ9.HPI_4OulrnpD8qI57P12tg'

ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App>
        <Route path='/home' component={Home} />
        <Route path='/data' component={Data} />
        <Route path='/data/observations/:observationId' component={Observation} />
        <Route path='/surveys' component={Surveys} />
        <Route path='/about' component={About} />
        <Redirect from='/' to='/home' />
      </App>
    </HashRouter>
  </Provider>, document.getElementById('root')
)
