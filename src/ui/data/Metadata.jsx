'use strict'
const React = require('react')
const PropTypes = require('prop-types')
const get = require('object-path').get
class Metadata extends React.Component {
  render () {
    const { observation } = this.props
    const tags = Object.keys(get(observation, 'properties', {})).filter(t => t.charAt(0) !== '_')
    return (
      <aside role='complementary' className='sidebar--observations'>
        <div className='meta__group'>
          <h2 className='data__subtitle'>Basic Information</h2>
          <dl>
            <dt className='data__tag'>Name of point</dt>
            <dd className='data__tag-def'>{get(observation, 'properties.name', '--')}</dd>
          </dl>
        </div>
        <div className='meta__group'>
          <h2 className='data__subtitle'>Tags</h2>
          {tags.length ? (
            <ul className='meta__prose'>
              {tags.map(t => <li key={t}>{t}: {observation.properties[t]}</li>)}
            </ul>
            ) : <p>--</p>}
        </div>
      </aside>
    )
  }
}

Metadata.proptypes = {
  observation: PropTypes.object
}

module.exports = Metadata
