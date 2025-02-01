import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "queueIdImportMessages", {
      references: { model: "Queues", key: "id" },
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Whatsapps", "queueIdImportMessages"),
    ])
  }
};
