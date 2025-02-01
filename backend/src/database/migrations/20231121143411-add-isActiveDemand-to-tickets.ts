import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "isActiveDemand", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,

    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "isActiveDemand");
  }
};
