import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn('Whatsapps', 'collectiveVacationMessage', {
      type: DataTypes.TEXT,
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn('Whatsapps', 'collectiveVacationMessage', {
      type: DataTypes.STRING,
    })
  }
};

