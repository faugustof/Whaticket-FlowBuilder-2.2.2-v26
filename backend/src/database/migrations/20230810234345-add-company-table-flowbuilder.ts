import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("FlowBuilders", "company_id", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("FlowBuilders", "company_id");
  }
};
