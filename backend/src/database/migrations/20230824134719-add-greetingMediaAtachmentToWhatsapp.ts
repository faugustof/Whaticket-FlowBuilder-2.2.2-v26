import { QueryInterface, DataTypes } from "sequelize";
//
module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "greetingMediaAttachment", {
      type: DataTypes.STRING,
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Whatsapps", "greetingMediaAttachment");
  }
};
