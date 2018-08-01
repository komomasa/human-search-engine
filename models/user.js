'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const User = loader.database.define('users', {
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  sitename: {
    type: Sequelize.STRING
  },
  profileImage: {
    type: Sequelize.STRING
  }
}, {
    freezeTableName: true,
    timestamps: false
  });

module.exports = User;