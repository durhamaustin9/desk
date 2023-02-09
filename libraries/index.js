const path = require('path')

const libraries = {
  SMS: require(path.join(process.cwd(), '/libraries/sms')),
  tools: require(path.join(process.cwd(), '/libraries/tools'))
}

module.exports = libraries
