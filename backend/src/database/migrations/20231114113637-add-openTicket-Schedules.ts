import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Schedules", "openTicket", {
      type: DataTypes.STRING,
      defaultValue: "disabled"
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Schedules", "openTicket")
  }
};