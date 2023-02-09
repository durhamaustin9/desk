const path = require('path')
const chalk = require('chalk')
const Sequelize = require('sequelize')

const logger = function (content) {
  console.log(`${chalk.bgCyan(' [START] ')} ${chalk.bgBlackBright.dim(content)} ${chalk.bgRedBright(' [END] ')}`)
}

const database = new Sequelize({
  database: process.env.DB_DATABASE,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOSTNAME,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  define: {
    timestamps: true
  },
  logging: logger
})

database.import(path.join(process.cwd(), '/models/user'))
database.import(path.join(process.cwd(), '/models/role'))

try {
  database.sync({
    force: false,
    alter: true
  }).then(data => {
    const associations = []
    const setup = []

    Object.keys(data.models).forEach(model => {
      associations.push(data.models[model].processAssociations())
      setup.push(data.models[model].processSetup())
    })

    doProcess(associations)
    doProcess(setup)
  })
} catch (error) {
  console.error(error.message)
}

const doProcess = (promises) => {
  Promise.all(promises).then(settled => {
    settled.forEach(processes => {
      processes.forEach(process => {
        logger(chalk.greenBright(process.status))

        if (process.status !== 'fulfilled') {
          try {
            console.log(chalk.bgRed.white(JSON.stringify(process, null, 1)))
          } catch (error) {
            console.log(chalk.bgRed.white(error.message))
            console.log(process)
          }
        }
      })
    })
  })
}

module.exports = database
