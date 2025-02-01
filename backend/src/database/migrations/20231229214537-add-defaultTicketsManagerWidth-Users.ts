import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Users", "defaultTicketsManagerWidth", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 550
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Users", "defaultTicketsManagerWidth")
  }
};
