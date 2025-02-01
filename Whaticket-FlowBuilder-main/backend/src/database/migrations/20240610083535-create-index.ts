import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se os índices já existem antes de tentar criá-los
    const indexNamesTicketTraking = await queryInterface.showIndex('TicketTraking');
    const indexNamesMessages = await queryInterface.showIndex('Messages');
    const indexNamesLogTickets = await queryInterface.showIndex('LogTickets');
    const indexNamesContactCustomFields = await queryInterface.showIndex('ContactCustomFields');
    const indexNamesUserRatings = await queryInterface.showIndex('UserRatings');
    const indexNamesTicketTags = await queryInterface.showIndex('TicketTags');

    if (!indexNamesTicketTraking.some(index => index.name === 'idx_TicketTraking_ticket_id')) {
      await queryInterface.addIndex('TicketTraking', ['ticketId'], { name: 'idx_TicketTraking_ticket_id' });
    }
    if (!indexNamesTicketTraking.some(index => index.name === 'idx_TicketTraking_company_id')) {
      await queryInterface.addIndex('TicketTraking', ['companyId'], { name: 'idx_TicketTraking_company_id' });
    } 

    if (!indexNamesUserRatings.some(index => index.name === 'idx_userratings_company_id')) {
      await queryInterface.addIndex('UserRatings', ['companyId'], { name: 'idx_userratings_company_id' });
    }

    if (!indexNamesUserRatings.some(index => index.name === 'idx_userratings_ticket_id')) {
      await queryInterface.addIndex('UserRatings', ['ticketId'], { name: 'idx_userratings_ticket_id' });
    }

    if (!indexNamesMessages.some(index => index.name === 'idx_Messages_contact_id')) {
      await queryInterface.addIndex('Messages', ['contactId'], { name: 'idx_Messages_contact_id' });
    }
    if (!indexNamesLogTickets.some(index => index.name === 'idx_LogTickets_ticket_id')) {
      await queryInterface.addIndex('LogTickets', ['ticketId'], { name: 'idx_LogTickets_ticket_id' });
    }
    if (!indexNamesContactCustomFields.some(index => index.name === 'idx_ContactCustomFields_contact_id')) {
      await queryInterface.addIndex('ContactCustomFields', ['contactId'], { name: 'idx_ContactCustomFields_contact_id' });
    }

    if (!indexNamesTicketTags.some(index => index.name === 'idx_TicketTags_ticket_id')) {
      await queryInterface.addIndex('TicketTags', ['ticketId'], { name: 'idx_TicketTags_ticket_id' });
    }

    if (!indexNamesTicketTags.some(index => index.name === 'idx_TicketTags_tag_id')) {
      await queryInterface.addIndex('TicketTags', ['tagId'], { name: 'idx_TicketTags_tag_id' });
    }

  },

  down: async (queryInterface, Sequelize) => {
    // Remoção dos índices criados
    await queryInterface.removeIndex('TicketTraking', 'idx_TicketTraking_ticket_id');
    await queryInterface.removeIndex('TicketTraking', 'idx_TicketTraking_company_id');
    await queryInterface.removeIndex('Messages', 'idx_Messages_contact_id');
    await queryInterface.removeIndex('LogTickets', 'idx_LogTickets_ticket_id');
    await queryInterface.removeIndex('ContactCustomFields', 'idx_ContactCustomFields_contact_id');
    await queryInterface.removeIndex('UserRatings', 'idx_userratings_company_id');
    await queryInterface.removeIndex('UserRatings', 'idx_userratings_ticket_id');
    await queryInterface.removeIndex('TicketTags', 'idx_TicketTags_ticket_id');
    await queryInterface.removeIndex('TicketTags', 'idx_TicketTags_tag_id');
  }
};
