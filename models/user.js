const crypto = require('crypto')
const path = require('path')
const libraries = require(path.join(process.cwd(), '/libraries'))

module.exports = (database, DataTypes) => {
  const user = database.define('user', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    uuid: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    roleKey: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'user'
    },
    firstName: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(256),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get () {
        let fullName = this.getDataValue('firstName')

        if (this.getDataValue('firstName') !== null && this.getDataValue('lastName') !== null) {
          fullName = `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`
        }

        return fullName
      }
    },
    phoneNumber: {
      type: DataTypes.STRING(10),
      allowNull: false,
      set (value) {
        this.setDataValue('phoneNumber', libraries.tools.regexp.doCleanPhoneNumber(value))
      }
    },
    password: {
      type: DataTypes.STRING(256),
      set (value) {
        const salt = crypto.randomBytes(8).toString('hex')
        const hash = crypto.pbkdf2Sync(value, salt, 1000, 64, 'sha512').toString('hex')

        this.setDataValue('salt', salt)
        this.setDataValue('password', hash)
      }
    },
    verificationCode: {
      type: DataTypes.STRING(6)
    },
    salt: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    createdAt: {
      type: 'DATETIME',
      defaultValue: database.Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updatedAt: {
      type: 'DATETIME',
      defaultValue: database.Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    deletedAt: {
      type: 'DATETIME'
    }
  }, {
    underscored: false,
    paranoid: true,
    timestamps: true
  })

  user.processAssociations = () => {
    const associations = []

    associations.push(user.belongsTo(database.models.role, {
      foreignKey: 'roleKey',
      targetKey: 'key',
      as: 'role',
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION'
    }))

    return Promise.allSettled(associations)
  }

  user.processSetup = () => {
    const processes = []

    processes.push(new Promise((resolve, reject) => {
      user.count().then((usersLength) => {
        if (usersLength === 0) {
          user.create({
            roleKey: 'admin',
            firstName: 'Johnny',
            lastName: 'Appleseed',
            email: 'admin@example.com',
            phoneNumber: '0000000000',
            password: 'password',
            isActive: true
          }).then(_ => {
            resolve()
          }).catch(error => {
            reject(error)
          })
        } else {
          resolve()
        }
      }).catch(error => {
        reject(error)
      })
    }))

    return Promise.allSettled(processes)
  }

  return user
}
