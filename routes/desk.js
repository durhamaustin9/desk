const path = require('path')
const router = require('express').Router()
const controllers = require(path.join(process.cwd(), '/controllers'))

/**
 *  Request a verification user from the query: phoneNumber
**/
router.get('/', async (request, response) => {
  controllers.desk.doMove(100, undefined).then(data => {
    response.status(200).json(data)
  }).catch(error => {
    response.status(500).json({ error: error.message })
  })
})

module.exports = router
