import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Webhooks", "active", {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
    await queryInterface.addColumn("Webhooks", "requestMonth", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn("Webhooks", "requestAll", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("Webhooks", "active");
    await queryInterface.removeColumn("Webhooks", "requestMonth");
    await queryInterface.removeColumn("Webhooks", "requestAll");
  }
};
