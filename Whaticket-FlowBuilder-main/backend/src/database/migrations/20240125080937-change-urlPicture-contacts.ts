import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn('Contacts', 'urlPicture', {
      type: DataTypes.TEXT,
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn('Contacts', 'urlPicture', {
      type: DataTypes.STRING,
    })
  }
};

