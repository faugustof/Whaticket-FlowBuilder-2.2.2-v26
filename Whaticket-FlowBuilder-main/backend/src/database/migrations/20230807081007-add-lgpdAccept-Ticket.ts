import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "lgpdAcceptedAt", {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true
    }),
    queryInterface.addColumn("Tickets", "lgpdSendMessageAt", {
      type: DataTypes.DATE,
      defaultValue: null,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "lgpdAcceptedAt"),
    queryInterface.removeColumn("Tickets", "lgpdSendMessageAt");
  }
};