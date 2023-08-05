const path = require('path')

require('dotenv').config({
  path: path.join(process.cwd(), '/.env')
})

const chalk = require('chalk')
const cors = require('cors')
const express = require('express')
const app = express()
const parser = require('body-parser')
const http = require('http')

app.use(cors({
  origin: process.env.HOSTNAME_ACCESS, optionsSuccessStatus: 200
}))

app.use(parser.urlencoded({
  extended: true
}))

app.use(parser.json())

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

const options = {}
const server = http.createServer(options, app)

server.listen(process.env.API_PORT, () => {
  console.log(`🌎 API listening on port ${process.env.API_PORT}`)
})
