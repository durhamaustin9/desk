const noble = require('@abandonware/noble')

const desk = {
  /**
   * Discover and initialize connection with peripheral
   * @returns {Promise<Object|Error>}
  **/
  doInitializeDesk: async function () {
    return new Promise(function (resolve, reject) {
      noble.startScanningAsync().then(_ => {
        noble.on('discover', (peripheral) => {
          if (peripheral.advertisement.localName && peripheral.advertisement.localName.includes('Desk')) {
            noble.stopScanningAsync().then(_ => {
              if (peripheral.state === 'disconnected') {
                peripheral.connectAsync().then(async _ => {
                  resolve(peripheral)
                }).catch(error => {
                  reject(new Error(error))
                })
              } else {
                resolve(peripheral)
              }
            }).catch(error => {
              reject(new Error(error))
            })
          }
        })

        setTimeout(() => {
          noble.stopScanningAsync().then(_ => {
            reject(new Error('Could Not Find Desk'))
          }).catch(error => {
            reject(new Error(error))
          })
        }, 30000)
      }).catch(error => {
        reject(new Error(error))
      })
    })
  },
  /**
   * Get current height of peripheral
   * @param desk - The peripheral
   * @returns {Promise<Number|Error>}
  **/
  doGetCurrentHeight: async function (desk) {
    return new Promise((resolve, reject) => {
      desk.discoverAllServicesAndCharacteristicsAsync().then(data => {
        const positionService = data.services.find((s) => s.uuid === '99fa0020338a10248a49009c0215f78a')
        const position = positionService.characteristics.find((c) => c.uuid === '99fa0021338a10248a49009c0215f78a')

        position.readAsync().then(heightInBytes => {
          resolve(62 + (heightInBytes.readInt16LE() / 100))
        }).catch(error => {
          reject(new Error(error))
        })
      }).catch(error => {
        reject(new Error(error))
      })
    })
  },
  /**
   * Stop moving peripheral
   * @param desk - The peripheral
   * @returns {Promise<Undefined|Error>}
  **/
  doStopMoving: async function (desk) {
    return new Promise((resolve, reject) => {
      desk.discoverAllServicesAndCharacteristicsAsync().then(data => {
        const controlService = data.services.find((s) => s.uuid === '99fa0001338a10248a49009c0215f78a')
        const control = controlService.characteristics.find((c) => c.uuid === '99fa0002338a10248a49009c0215f78a')

        control.writeAsync(Buffer.from('FF00', 'hex'), false).then(_ => {
          resolve()
        }).catch(error => {
          reject(new Error(error))
        })
      }).catch(error => {
        reject(new Error(error))
      })
    })
  },
  /**
   * Move peripheral up
   * @param desk - The peripheral
   * @returns {Promise<Undefined|Error>}
  **/
  doMoveUp: async function (desk) {
    return new Promise((resolve, reject) => {
      desk.discoverAllServicesAndCharacteristicsAsync().then(data => {
        const controlService = data.services.find((s) => s.uuid === '99fa0001338a10248a49009c0215f78a')
        const control = controlService.characteristics.find((c) => c.uuid === '99fa0002338a10248a49009c0215f78a')

        control.writeAsync(Buffer.from('4700', 'hex'), false).then(_ => {
          resolve()
        }).catch(error => {
          reject(new Error(error))
        })
      }).catch(error => {
        reject(new Error(error))
      })
    })
  },
  /**
   * Move peripheral down
   * @param desk - The peripheral
   * @returns {Promise<Undefined|Error>}
  **/
  doMoveDown: async function (desk) {
    return new Promise((resolve, reject) => {
      desk.discoverAllServicesAndCharacteristicsAsync().then(data => {
        const controlService = data.services.find((s) => s.uuid === '99fa0001338a10248a49009c0215f78a')
        const control = controlService.characteristics.find((c) => c.uuid === '99fa0002338a10248a49009c0215f78a')

        control.writeAsync(Buffer.from('4600', 'hex'), false).then(_ => {
          resolve()
        }).catch(error => {
          reject(new Error(error))
        })
      }).catch(error => {
        reject(new Error(error))
      })
    })
  },
  /**
   * Default Function
   * @param targetHeight - The desired height of the peripheral
   * @param desk - The peripheral
   * @returns {Promise<Number|Error>}
  **/
  doMove: async function (targetHeight, desk) {
    return new Promise((resolve, reject) => {
      // console.log(this._state)
      if (!desk) {
        this.doInitializeDesk().then(desk => {
          noble.removeAllListeners('discover')

          this.doMove(targetHeight, desk).then(currentHeight => {
            resolve(currentHeight)
          }).catch(error => {
            reject(new Error(error))
          })
        }).catch(error => {
          reject(new Error(error))
        })
      } else {
        this.doGetCurrentHeight(desk).then(currentHeight => {
          if (Math.abs(currentHeight - targetHeight) <= 1) {
            this.doStopMoving(desk).then(_ => {
              desk.disconnectAsync().then(_ => {
                resolve(currentHeight)
              }).catch(error => {
                reject(new Error(error))
              })
            }).catch(error => {
              reject(new Error(error))
            })
          } else {
            if (currentHeight < targetHeight) {
              this.doMoveUp(desk).then(_ => {
                this.doMove(targetHeight, desk).then(currentHeight => {
                  resolve(currentHeight)
                }).catch(error => {
                  reject(new Error(error))
                })
              }).catch(error => {
                reject(new Error(error))
              })
            } else {
              this.doMoveDown(desk).then(_ => {
                this.doMove(targetHeight, desk).then(currentHeight => {
                  resolve(currentHeight)
                }).catch(error => {
                  reject(new Error(error))
                })
              }).catch(error => {
                reject(new Error(error))
              })
            }
          }
        }).catch(error => {
          reject(new Error(error))
        })
      }
    })
  }
}

module.exports = desk
