'use strict';
const Sequelize = require('sequelize');
const sequelize = new Sequelize(
  'postgres://postgres:postgres@localhost/human_search_engine',
  { logging: true });

module.exports = {
  database: sequelize,
  Sequelize: Sequelize
};