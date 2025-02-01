import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se os índices já existem antes de tentar criá-los
    const constraints = await queryInterface.showConstraint('Chatbots');

    if (constraints.some(constraint => constraint.constraintName === 'Chatbots_optIntegrationId_fkey')) {
      await queryInterface.removeConstraint('Chatbots', 'Chatbots_optIntegrationId_fkey');
    }

    await queryInterface.addConstraint('Chatbots', {
      fields: ['optIntegrationId'],
      type: 'foreign key',
      name: 'Chatbots_optIntegrationId_fkey',
      references: {
        table: 'QueueIntegrations',
        field: 'id'
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remoção dos índices criados
    await queryInterface.removeConstraint('Chatbots', 'Chatbots_optIntegrationId_fkey');
  }
};
