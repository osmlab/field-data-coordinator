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
        <nav role='navigation'>
          <Link to='/home' className={this.activeClass('/home')}>
            <h1 className='header__title'>{t.header.title}</h1>
          </Link>
          <Link to='/data' className={this.activeClass('/data')}>
            {t.header.data}
          </Link>
          <Link to='/surveys' className={this.activeClass('/surveys')}>
            {t.header.survey}
          </Link>
          <Link to='/about' className={this.activeClass('/about')}>
            {t.header.about}
          </Link>
        </nav>
      </header>
    )
  }
}
module.exports = withRouter(Header)
