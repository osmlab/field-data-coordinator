const React = require('react')
const ReactDOM = require('react-dom')
const { createStore, applyMiddleware } = require('redux')
const { Provider } = require('react-redux')
const thunkMiddleware = require('redux-thunk').default
const { HashRouter, Route } = require('react-router-dom')
const { MuiThemeProvider } = require('material-ui/styles')
const Home = require('./ui/Home.jsx')
const reducers = require('./reducers/index.js')

// https://github.com/callemall/material-ui#react-tap-event-plugin
require('react-tap-event-plugin')()

const store = createStore(reducers, applyMiddleware(thunkMiddleware))

ReactDOM.render((
  <MuiThemeProvider>
    <Provider store={store}>
      <HashRouter>
        <Route path='/' component={Home} />
      </HashRouter>
    </Provider>
  </MuiThemeProvider>
), document.getElementById('root'))
