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

/**
 *  Request a verification user from the query: phoneNumber
 **/
router.get('/test', async (request, response) => {
  response.status(200).json({
    test: 'test'
  })
})

module.exports = router
