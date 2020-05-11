// https://cli.vuejs.org/guide/cli-service.html

const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

/** @type import('@vue/cli-service').ProjectOptions */
module.exports = {
  chainWebpack: config => {
    // Setup aliases for import paths.
    config.resolve.alias.merge({
      '@tests': resolve('tests/unit'),
      '@components': resolve('tests/components'),
      '@helpers': resolve('tests/helpers'),
      '@stores': resolve('tests/stores'),
      'vuex-stores': resolve('src/main.js')
    })

    return config
  }
}
