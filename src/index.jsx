const React = require('react')
const ReactDOM = require('react-dom')
const Home = require('./ui/Home.jsx')

// https://github.com/callemall/material-ui#react-tap-event-plugin
require('react-tap-event-plugin')()

ReactDOM.render(<Home />, document.getElementById('root'))
