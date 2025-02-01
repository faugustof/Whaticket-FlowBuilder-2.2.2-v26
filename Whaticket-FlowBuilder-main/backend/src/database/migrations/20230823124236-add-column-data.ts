import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize) => {
    await queryInterface.addColumn("Tickets", "dataWebhook", {
      type: DataTypes.JSON,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "dataWebhook");
  }
};
