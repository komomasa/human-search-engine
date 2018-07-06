'use strict';
const loader = require('./sequelize-loader');
const Sequelize = loader.Sequelize;

const Search = loader.database.define('searches', {
  searchId: {
    type: Sequelize.UUID,
    primaryKey: true,
    allowNull: false
  },
  searchName: {
    type: Sequelize.STRING
  },
  searchText: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  createdBy: {
    type: Sequelize.BIGINT,
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
        fields: ['createdBy']
      }
    ]
  });

module.exports = Search;