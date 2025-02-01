import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('ScheduledMessages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      data_mensagem_programada: {
        type: DataTypes.DATE
      },
      id_conexao: {
        type: DataTypes.STRING
      },
      intervalo: {
        type: DataTypes.STRING
      },
      valor_intervalo: {
        type: DataTypes.STRING
      },
      mensagem: {
        type: DataTypes.TEXT
      },
      tipo_dias_envio: {
        type: DataTypes.STRING
      },
      mostrar_usuario_mensagem: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      criar_ticket: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      contatos: {
        type: DataTypes.JSONB
      },
      tags: {
        type: DataTypes.JSONB
      },
      companyId: {
        type: DataTypes.INTEGER
      },
      nome: {
        type: DataTypes.STRING
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
      tipo_arquivo: {
        type: DataTypes.STRING
      },
      usuario_envio: {
        type: DataTypes.STRING
      },
      enviar_quantas_vezes: {
        type: DataTypes.STRING
      }
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('ScheduledMessages');
  }
};
