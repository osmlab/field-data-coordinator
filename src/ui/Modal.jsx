'use strict'
const PropTypes = require('prop-types')
const React = require('react')
class Modal extends React.Component {
  render () {
    return (
      <div className={this.props.className}>
        <div className='modal' />
        <div className='modal__inner'>{this.props.children}</div>
      </div>
    )
  }
}
Modal.PropTypes = {
  className: PropTypes.string
}
module.exports = Modal
