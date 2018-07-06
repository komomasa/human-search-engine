'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Answer = loader.database.define('answeres', {
  answerId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  answerText: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  searchId: {
    type: Sequelize.UUID,
    allowNull: false
  },
  updatedAt: {
    type: Sequelize.DATE,
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

module.exports = Answer;