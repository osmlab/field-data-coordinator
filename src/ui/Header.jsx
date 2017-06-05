'use strict'
const React = require('react')
const FlatButton = require('material-ui/FlatButton').default

const t = {
  header: {
    title: 'Field Data Coordinator',
    data: 'Data',
    survey: 'Surveys',
    about: 'About'
  }
}

module.exports = class Header extends React.Component {
  render () {
    return (
      <header className='header'>
        <h1 className='header__title'>{t.header.title}</h1>
        <FlatButton label={t.header.data} />
        <FlatButton label={t.header.survey} />
        <FlatButton label={t.header.about} />
      </header>
    )
  }
}
