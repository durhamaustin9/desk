const path = require('path')
const router = require('express').Router()

const controllers = require(path.join(process.cwd(), '/controllers'))

/**
 *  Request a verification user from the query: phoneNumber
 */
router.get('/auth/otp', async (request, response) => {
  controllers.user.auth.doRequestVerificationCode(request.query.phoneNumber).then(data => {
    response.status(200).json(data)
  }).catch(error => {
    response.status(500).json({ error: error.message })
  })
})

/**
 * Request OTP Authorization from the body: phoneNumber and verificationCode
 */
router.post('/auth/otp', async (request, response) => {
  controllers.user.auth.doAuthenticateOTP(request.body.phoneNumber, request.body.verificationCode).then(data => {
    response.status(200).json(data)
  }).catch(error => {
    response.status(500).json({ error: error.message })
  })
})

/**
 * Request Authorization using email and password
 */
router.post('/auth/email', async (request, response) => {
  controllers.user.auth.doAuthenticatePassword(request.body.email, request.body.password).then(data => {
    response.status(200).json(data)
  }).catch(error => {
    response.status(500).json({ error: error.message })
  })
})

/**
 * Register a user who is new (no auth required)
 */
router.post('/auth/register', async (request, response) => {
  response.status(200).json({ error: 'This route is not built out' })
})

/**
 * Create a user from another user who is authorized
 */
router.post('/', async (request, response) => {
  controllers.user.doCreate(request.body).then(_ => {
    response.status(200).json()
  }).catch(error => {
    response.status(500).json({ error: error.message })
  })
})

/**
 * Read profile information for the user that made the request
 */
router.get('/profile', async (request, response) => {
  controllers.user.profile.doRead(request.user.id).then(user => {
    response.status(200).json(user)
  }).catch(error => {
    response.status(500).json({ error: error.message })
  })
})

module.exports = router
