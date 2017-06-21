'use strict'
const React = require('react')
const RaisedButton = require('material-ui/RaisedButton').default
const Modal = require('../Modal.jsx')
const SelectionMap = require('./Select-Geography-Map.jsx')

class SelectGeography extends React.Component {
  constructor (props) {
    super(props)
    this.state = { active: false }
  }

  componentWillMount () {
    this.handleShortcuts = this.handleShortcuts.bind(this)
    document.addEventListener('keydown', this.handleShortcuts)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleShortcuts)
  }

  render () {
    return (
      <div>
        <RaisedButton
          label='Select a geographic area'
          onTouchTap={() => this.setState({ active: true })}
        />

        {this.state.active ? (
          <Modal>
            <SelectionMap />
            <RaisedButton primary label='Confirm' />
            <RaisedButton secondary label='Cancel'
              onTouchTap={() => this.setState({ active: false })}
            />
          </Modal>
        ) : null}
      </div>
    )
  }

  handleShortcuts ({ keyCode }) {
    switch (keyCode) {
      case (27): // esc
        return this.setState({ active: false })
    }
  }
}

module.exports = SelectGeography
