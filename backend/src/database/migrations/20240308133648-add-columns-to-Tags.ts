import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tags", "timeLane", {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true
    }),
    queryInterface.addColumn("Tags", "nextLaneId", {
      type: DataTypes.INTEGER,
      allowNull: true
    }),
    queryInterface.addColumn("Tags", "greetingMessageLane", {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tags", "timeLane"),
    queryInterface.removeColumn("Tags", "nextLaneId"),
    queryInterface.removeColumn("Tags", "greetingMessageLane");
  }
};