'use strict'
const React = require('react')
class Metadata extends React.Component {
  render () {
    return (
      <aside role='complementary' className='sidebar--observations'>
        <div className='meta__group'>
          <h2 className='data__subtitle'>Basic Information <span><a className='link--primary link--edit'>Edit</a></span></h2>
          <dl>
            <dt className='data__tag'>Name of point</dt>
            <dd className='data__tag-def'>Cheboygan Area State Part</dd>
            <dt className='data__tag'>Address</dt>
            <dd className='data__tag-def'>124 Cheboygan Dr. Cheboygan MI, 49721</dd>
          </dl>
        </div>
        <div className='meta__group'>
          <h2 className='data__subtitle'>Notes</h2>
          <p className='meta__prose'>Add anything that is happening at this point in time that you think is valuable to record.</p>
          <a className='link--primary'>+ Add a New Note</a>
        </div>
        <div className='meta__group'>
          <h2 className='data__subtitle'>Tags <span><a className='link--primary link--edit'>Edit</a></span></h2>
          <ul className='meta__prose'>
            <li>Natural/Oil Spill</li>
            <li>Hazard</li>
          </ul>
          <a className='link--primary'> + Add a New Tag</a>
        </div>
      </aside>
    )
  }
}
module.exports = Metadata
