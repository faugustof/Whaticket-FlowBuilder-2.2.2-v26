import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Messages", "ticketTrakingId", {
      type: DataTypes.INTEGER,
      references: { model: "TicketTraking", key: "id" },
      onUpdate: "SET NULL",
      onDelete: "SET NULL"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Messages", "ticketTrakingId");
  }
};
