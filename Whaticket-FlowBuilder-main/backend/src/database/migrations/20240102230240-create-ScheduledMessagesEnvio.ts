import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('ScheduledMessagesEnvios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      mediaPath: {
        type: DataTypes.STRING
      },
      mediaName: {
        type: DataTypes.STRING
      },
      mensagem: {
        type: DataTypes.TEXT
      },
      companyId: {
        type: DataTypes.INTEGER
      },
      data_envio: {
        type: DataTypes.DATE
      },
      scheduledmessages: {
        type: DataTypes.INTEGER
      },
      key: {
        type: DataTypes.STRING
      }
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('ScheduledMessagesEnvios');
  }
};
