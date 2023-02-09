const pathToRegexp = require('path-to-regexp').pathToRegexp
const ejwt = require('express-jwt')

function authentication () {
  return ejwt({ secret: process.env.JWT_KEY, algorithms: ['HS256'] }).unless({
    path: [
      {
        url: pathToRegexp('/user/auth(.*)'),
        methods: ['GET', 'POST', 'OPTIONS']
      }
    ]
  })
}

module.exports = authentication
