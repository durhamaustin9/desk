const path = require('path')
const db = require(path.join(process.cwd(), '/models'))
const libraries = require(path.join(process.cwd(), '/libraries'))
const JWT = require('jsonwebtoken')
const crypto = require('crypto')

const user = {
  /**
   * All Authentication methods for a user
   */
  auth: {
    /**
     * Request a verification code by SMS on an active user
     * @param phoneNumber - The user phone number to request code
     * @returns {Promise<undefined|Error>}
     */
    doRequestVerificationCode: function (phoneNumber) {
      phoneNumber = libraries.tools.regexp.doCleanPhoneNumber(phoneNumber)

      return new Promise((resolve, reject) => {
        db.models.user.findOne({
          where: {
            phoneNumber: phoneNumber,
            isActive: true
          },
          raw: true
        }).then(user => {
          if (user !== null) {
            const verification = []

            while (verification.length < 2) {
              const code = Math.floor(100 + Math.random() * 900)

              if (verification.indexOf(code) === -1) verification.push(code)
            }

            db.models.user.update({
              verificationCode: verification.join('')
            }, {
              where: {
                id: user.id
              }
            }).then(_ => {
              new libraries.SMS().doSend(phoneNumber, `(${process.env.APP_NAME}) Hey ${user.firstName}, Your login code is ${verification[0]}-${verification[1]}`).then(_ => {
                resolve()
              }).catch(error => {
                reject(error)
              })
            }).catch(error => {
              reject(error)
            })
          } else {
            resolve()
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    /**
     * Authorize a user using a phone number and verification code
     * @param phoneNumber - The user phone number to request code
     * @param verificationCode - The verification code received by the user
     * @returns {Promise<Object|Error>}
     */
    doAuthenticateOTP: function (phoneNumber, verificationCode) {
      phoneNumber = libraries.tools.regexp.doCleanPhoneNumber(phoneNumber)
      verificationCode = libraries.tools.regexp.doRemoveAllExceptNumbers(verificationCode)

      return new Promise((resolve, reject) => {
        db.models.user.findOne({
          where: {
            phoneNumber: phoneNumber,
            verificationCode: verificationCode,
            isActive: true
          },
          include: [
            {
              model: db.models.role,
              as: 'role',
              attributes: ['authHome']
            }
          ]
        }).then(user => {
          if (user !== null) {
            db.models.user.update({
              verificationCode: null
            }, {
              where: {
                id: user.id
              }
            }).then(_ => {
              const token = JWT.sign({
                id: user.id,
                roleKey: user.roleKey,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber
              }, process.env.JWT_KEY, { expiresIn: '30d' })

              resolve({
                id: user.id,
                roleKey: user.roleKey,
                fullName: user.fullName,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                authHome: user.role.authHome,
                token: token
              })
            }).catch(error => {
              reject(error)
            })
          } else {
            reject(new Error('Incorrect OTP'))
          }
        }).catch(error => {
          reject(error)
        })
      })
    },

    /**
     * Authorize a user from email and password
     * @param email - The email the user wants to sign in with
     * @param password - The raw value password to check password against
     */
    doAuthenticatePassword: function (email, password) {
      return new Promise((resolve, reject) => {
        db.models.user.findOne({
          where: {
            email: email
          },
          include: [
            {
              model: db.models.role,
              as: 'role',
              attributes: ['authHome']
            }
          ]
        }).then(user => {
          const salt = user.salt

          const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
          if (user.password === hashedPassword) {
            const token = JWT.sign({
              id: user.id,
              roleKey: user.roleKey,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber
            }, process.env.JWT_KEY, { expiresIn: '30d' })

            resolve({
              id: user.id,
              roleKey: user.roleKey,
              fullName: user.fullName,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phoneNumber: user.phoneNumber,
              authHome: user.role.authHome,
              token: token
            })
          } else {
            reject(new Error('Credentials are incorrect'))
          }
        }).catch(_ => {
          reject(new Error('Credentials are incorrect'))
        })
      })
    }
  },

  /**
   * All profile methods for a user
   */
  profile: {
    /**
     * Read profile information for user
     * @param id - Id of user to perform query
     * @returns {Promise<Object|null>}
     */
    doRead (id) {
      return new Promise((resolve, reject) => {
        db.models.user.findOne({
          where: {
            id: id,
            isActive: true
          }
        }).then(user => {
          resolve({
            id: user.id,
            roleKey: user.roleKey,
            fullName: user.fullName,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber
          })
        }).catch(error => {
          reject(error)
        })
      })
    }
  },

  /**
   * Create a user within the users table
   * @param user | Object with keys and values according to users table
   * @returns {Promise<Object|Error>}
   */
  doCreate (user) {
    return new Promise((resolve, reject) => {
      db.models.user.create(user).then(user => {
        delete user.password
        delete user.verificationCode
        delete user.salt

        resolve(user)
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * Updates a user within the users table
   * @param id | The ID of the user (user.id)
   * @param user | Object with keys and values that will be updated base by the user's id.
   * @returns {Promise<undefined|Error>}
   */
  doUpdate (id, user) {
    return new Promise((resolve, reject) => {
      db.models.user.update(user, {
        where: {
          id: id
        }
      }).then(_ => {
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  /**
   * Deletes a user within the users table - (Does not remove row, marks as destroyed)
   * @param id | The ID of the user (user.id)
   * @returns {Promise<undefined|Error>}
   */
  doDestroy (id) {
    return new Promise((resolve, reject) => {
      db.models.user.destroy({
        where: {
          id: id
        }
      }).then(_ => {
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  }
}

module.exports = user
