if (process.env.NODE_ENV === 'development') {
  console.log('in development')
  const electronHot = require('electron-hot-loader')
  electronHot.install()
  electronHot.watchJsx(['src/**/*.jsx'])
  electronHot.watchCss(['src/assets/**/*.css'])
}

require('./index.jsx')
