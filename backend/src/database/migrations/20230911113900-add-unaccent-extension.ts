import { QueryInterface, DataTypes, Sequelize } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "unaccent"')
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query('DROP EXTENSION IF EXISTS "unaccent"');
  }
};
