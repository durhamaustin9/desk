const path = require('path')

require('dotenv').config({
  path: path.join(process.cwd(), '/.env')
})

const chalk = require('chalk')
const cors = require('cors')
const express = require('express')
const socket = require('socket.io')
const app = express()
const parser = require('body-parser')
const https = require('https')
const http = require('http')
const fs = require('fs')

app.use(cors({
  origin: process.env.HOSTNAME_ACCESS, optionsSuccessStatus: 200
}))

app.use(parser.urlencoded({
  extended: true
}))

app.use(parser.json())

app.use(require(path.join(process.cwd(), '/middleware/authentication'))())
app.all('*', require(path.join(process.cwd(), '/middleware/authorization')))

/**
 * Unhandled error handling
 */
app.use((error, request, response, next) => {
  response.status(error.status).send({ error: error.message })

  next()
})

/**
 * Dev debugging logger
 */
app.use((request, response, next) => {
  console.log(`
${chalk.bgGreenBright(' [REQUEST] ')} ${chalk.bgWhite.black(` [${request.method}] `)}
${chalk.bgBlackBright(` ${request.socket.remoteAddress} ==> ${request.originalUrl} `)}

${chalk.bgBlueBright('       [USER]        ')}
${chalk.blueBright(JSON.stringify(request.user ? request.user : {}, null, 2))}

${chalk.bgYellowBright('       [QUERY]       ')}
${chalk.yellowBright(JSON.stringify(request.query, null, 2))}

${chalk.bgMagentaBright('      [PARAMS]       ')}
${chalk.magentaBright(JSON.stringify(request.params, null, 2))}

${chalk.bgCyanBright('       [BODY]        ')}
${chalk.cyanBright(JSON.stringify(request.body, null, 2))}
`)

  next()
})

app.use('/', require(path.join(process.cwd(), '/routes')))

let options = {}
let server = http.createServer(options, app)

try {
  options = {
    key: fs.readFileSync(path.join(process.cwd(), process.env.SSL_KEY), 'utf8'),
    cert: fs.readFileSync(path.join(process.cwd(), process.env.SSL_CERTIFICATE), 'utf8'),
    ca: fs.readFileSync(path.join(process.cwd(), process.env.SSL_BUNDLE_CERTIFICATE), 'utf8')
  }

  server = https.createServer(options, app)
} catch (error) {
  console.error('Unable to load SSL - Running on standard HTTP')
}

const io = new socket.Server(server, {
  allowEIO3: true,
  cors: {
    origin: process.env.HOSTNAME_ACCESS,
    methods: ['GET', 'OPTIONS'],
    credentials: false
  }
})

server.listen(process.env.API_PORT, () => {
  console.log(`🌎 API listening on port ${process.env.API_PORT}`)
})
