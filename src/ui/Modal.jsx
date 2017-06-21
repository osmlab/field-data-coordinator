'use strict'
const React = require('react')
class Modal extends React.Component {
  render () {
    return (
      <div>
        <div className='modal' />
        <div className='modal__inner'>{this.props.children}</div>
      </div>
    )
  }
}
module.exports = Modal
