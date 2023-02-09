const database = require(require('path').join(process.cwd(), '/models'))

module.exports = (request, response, next) => {
  if (request.user) {
    database.models.user.findOne({
      where: {
        id: request.user.id,
        isActive: true
      }
    }).then(_ => {
      next()
    }).catch(_ => {
      response.status(403).send({ error: 'Authorization not found' })
    })
  } else {
    next()
  }
}
