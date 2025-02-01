import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Schedules", "intervalo", {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }),
    queryInterface.addColumn("Schedules", "valorIntervalo", {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }),
    queryInterface.addColumn("Schedules", "enviarQuantasVezes", {
      type: DataTypes.INTEGER,
      defaultValue: 1
    }),
    queryInterface.addColumn("Schedules", "tipoDias", {
      type: DataTypes.INTEGER,
      defaultValue: 4
    }),
    queryInterface.addColumn("Schedules", "contadorEnvio", {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }),
    queryInterface.addColumn("Schedules", "assinar", {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Schedules", "intervalo"),
    queryInterface.removeColumn("Schedules", "valorIntervalo"),
    queryInterface.removeColumn("Schedules", "enviarQuantasVezes"),
    queryInterface.removeColumn("Schedules", "tipoDias"),
    queryInterface.removeColumn("Schedules", "contadorEnvio"),
    queryInterface.removeColumn("Schedules", "assinar")
  }
};