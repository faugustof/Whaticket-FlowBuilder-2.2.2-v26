import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Invoices", "linkInvoice", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ""
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Invoices", "linkInvoice")
  }
};
