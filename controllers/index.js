const path = require('path')

module.exports = {
  user: require(path.join(process.cwd(), '/controllers/user'))
}
