/** 
 * @TercioSantos-0 |
 * migração/CompaniesSettings |
 * @descrição:migração tabela para configurações das empresas 
 */
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("CompaniesSettings", {
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
        onDelete: "CASCADE",
        allowNull: false
      },
      hoursCloseTicketsAuto: {
        type: DataTypes.STRING,
        allowNull: false
      },
      chatBotType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      acceptCallWhatsapp: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userRandom: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sendGreetingMessageOneQueues: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sendSignMessage: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sendFarewellWaitingTicket: {
        type: DataTypes.STRING,
        allowNull: false
      },
      userRating: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sendGreetingAccepted: {
        type: DataTypes.STRING,
        allowNull: false
      },
      CheckMsgIsGroup: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sendQueuePosition: {
        type: DataTypes.STRING,
        allowNull: false
      },
      scheduleType: {
        type: DataTypes.STRING,
        allowNull: false
      },
      acceptAudioMessageContact: {
        type: DataTypes.STRING,
        allowNull: false
      },
      enableLGPD: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sendMsgTransfTicket: {
        type: DataTypes.STRING,
        allowNull: false
      },
      requiredTag: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lgpdDeleteMessage: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lgpdHideNumber: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lgpdConsent: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lgpdLink: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lgpdMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("CompaniesSettings");
  }
};