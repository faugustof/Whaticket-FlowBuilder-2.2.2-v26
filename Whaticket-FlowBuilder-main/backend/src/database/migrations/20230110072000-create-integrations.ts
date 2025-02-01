import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Integrations", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      foneContact: {
        type: DataTypes.STRING,
        allowNull: true
      },
      userLogin: {
        type: DataTypes.STRING,
        allowNull: true
      },
      passLogin: {
        type: DataTypes.STRING,
        allowNull: true
      },
      finalCurrentMonth: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      initialCurrentMonth: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Integrations");
  }
};
