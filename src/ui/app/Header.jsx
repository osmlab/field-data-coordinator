'use strict'
const React = require('react')
const { Link } = require('react-router-dom')
const { withRouter } = require('react-router')

const t = {
  header: {
    title: 'Field Data Coordinator',
    data: 'Data',
    survey: 'Surveys',
    about: 'About'
  }
}

class Header extends React.Component {
  activeClass (match) {
    const { pathname } = this.props.location
    return pathname.slice(0, match.length) === match ? 'header__active' : null
  }

  render () {
    return (
      <header className='header'>
        <div className='row'>
        <nav role='navigation'>
          <ul>
            <li className='navItem navItemHome'>
              <Link to='/home' className={this.activeClass('/home')}>
                <h1 className='header__title navItemLink'>{t.header.title}</h1>
              </Link>
            </li>
            <li className='navItem'>
              <Link to='/data' className={this.activeClass('/data')} className='navItemLink'>
                {t.header.data}
              </Link>
            </li>
            <li className='navItem'>
              <Link to='/surveys' className={this.activeClass('/surveys')} className='navItemLink'>
                {t.header.survey}
              </Link>
            </li>
            <li className='navItem'>
              <Link to='/about' className={this.activeClass('/about')}  className='navItemLink'>
                {t.header.about}
              </Link>
            </li>
          </ul>
        </nav>
        </div>
      </header>
    )
  }
}
module.exports = withRouter(Header)
