'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Evaluation = loader.database.define('evaluationes', {
  answerId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  evaluation: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  searchId: {
    type: Sequelize.UUID,
    allowNull: false
  }
}, {
    freezeTableName: true,
    timestamps: false,
    indexes: [
      {
        fields: ['searchId']
      }
    ]
  });

module.exports = Evaluation;