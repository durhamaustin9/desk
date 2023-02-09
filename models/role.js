module.exports = (database, DataTypes) => {
  const role = database.define('role', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    authHome: {
      type: DataTypes.STRING(16),
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

  role.processAssociations = () => {
    const associations = []

    return Promise.allSettled(associations)
  }

  role.processSetup = () => {
    const processes = []

    processes.push(role.findOrCreate({
      where: {
        key: 'admin'
      },
      defaults: {
        key: 'admin',
        name: 'Admin',
        authHome: 'admin'
      }
    }))

    processes.push(role.findOrCreate({
      where: {
        key: 'user'
      },
      defaults: {
        key: 'user',
        name: 'User',
        authHome: 'home'
      }
    }))

    return Promise.allSettled(processes)
  }

  return role
}
