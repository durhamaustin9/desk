// const noble = require('@abandonware/noble')
// const idasenController = require('idasen-controller')
// import idasenController from 'idasen-controller'
import idasenController from 'idasen-controller'
const path = require('path')
const router = require('express').Router()

const controllers = require(path.join(process.cwd(), '/controllers'))

const { deskManager } = idasenController
// const { deskManager } = idasenController
// const { deskManager } = deskManager

/**
 *  Request a verification user from the query: phoneNumber
 */
router.get('/', async (request, response) => {
  // noble.on('stateChange', callback(state));
  // noble.startScanning()
  // noble.startScanning([], true)
  // ida deskManage

  // deskManager.getAvailableDevices().then(devices => {
  //   console.log(devices)
  // })
  const devices = await deskManager.scanAsync()
  // // console.log(devices)
  const deskDevice = devices.find((device) => device.name.includes('Desk'))
  //
  await deskManager.connectAsync(deskDevice.address)
  await deskManager.desk.moveToAsync(80)
  await deskManager.desk.moveToAsync(75)
  //
  await deskManager.disconnectAsync(deskManager.desk)

  // noble.on('stateChange', async (state) => {
  //   console.log(state)
  //   if (state === 'poweredOn') {
  //     await noble.startScanning([], false)
  //     // noble.startScanning()
  //   }
  // })
  //
  // noble.on('discover', async (peripheral) => {
  //   // await noble.stopScanningAsync()
  //
  //   // if (peripheral.advertisement.localName !== undefined) {
  //   //   console.log(peripheral.advertisement)
  //   // }
  //
  //   if (peripheral.advertisement.localName === 'Desk 9026') {
  //     peripheral.connect()
  //
  //     peripheral.once('connect', async (desk) => {
  //       console.log(desk)
  //     })
  //   }
  // })
  // var serviceUUIDs = ['<service UUID 1>', ...]; // default: [] => all
  // var allowDuplicates = falseOrTrue; // default: false
  //
  // noble.startScanning(serviceUUIDs, allowDuplicates[, callback(error)]);
  response.status(200).json({ testing: 'test' })
  // controllers.user.auth.doRequestVerificationCode(request.query.phoneNumber).then(data => {
  //   response.status(200).json({ testing: 'test' })
  // }).catch(error => {
  //   response.status(500).json({ error: error.message })
  // })
})

module.exports = router
