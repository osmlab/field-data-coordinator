'use strict'
const React = require('react')
const Header = require('./Header.jsx')
const Sidebar = require('./Sidebar.jsx')

module.exports = class App extends React.Component {
  render () {
    return (
      <div className='content'>
        <Header />
        <Sidebar />
        <main role='main' className='main'>
          {this.props.children}
        </main>
      </div>
    )
  }
}
