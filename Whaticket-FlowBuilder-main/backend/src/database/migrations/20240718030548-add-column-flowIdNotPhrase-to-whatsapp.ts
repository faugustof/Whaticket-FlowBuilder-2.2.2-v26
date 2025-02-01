import { QueryInterface, DataTypes } from "sequelize";
// Adicionar a coluna flowBuilderId na tabela Whatsapp

module.exports = {

  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Whatsapps", "flowIdNotPhrase", {
      type: DataTypes.INTEGER,
      references: {
        model: "FlowBuilders",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    // Remover a coluna flowBuilderId da tabela Whatsapp
    queryInterface.removeColumn("Whatsapps", "flowIdNotPhrase");
  }

}
