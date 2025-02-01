import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifica se os índices já existem antes de tentar criá-los
    const indexNamesMessage = await queryInterface.showIndex('Messages');
    const indexNamesTicket = await queryInterface.showIndex('Tickets');
    const indexNamesContactTag = await queryInterface.showIndex('ContactTags');
    const indexNamesQueue = await queryInterface.showIndex('Queues');
    const indexNamesContact = await queryInterface.showIndex('Contacts');

    if (!indexNamesMessage.some(index => index.name === 'idx_message_ticket_id')) {
      await queryInterface.addIndex('Messages', ['ticketId'], { name: 'idx_message_ticket_id' });
    }
    if (!indexNamesMessage.some(index => index.name === 'idx_message_company_id')) {
      await queryInterface.addIndex('Messages', ['companyId'], { name: 'idx_message_company_id' });
    }

    if (!indexNamesTicket.some(index => index.name === 'idx_ticket_contact_id')) {
        await queryInterface.addIndex('Tickets', ['contactId'], { name: 'idx_ticket_contact_id' });
    }
    if (!indexNamesTicket.some(index => index.name === 'idx_ticket_whatsapp_id')) {
        await queryInterface.addIndex('Tickets', ['whatsappId'], { name: 'idx_ticket_whatsapp_id' });
    }
    if (!indexNamesTicket.some(index => index.name === 'idx_ticket_queue_id')) {
        await queryInterface.addIndex('Tickets', ['queueId'], { name: 'idx_ticket_queue_id' });
    }
    if (!indexNamesTicket.some(index => index.name === 'idx_ticket_id')) {
        await queryInterface.addIndex('Tickets', ['id'], { name: 'idx_ticket_id' });
    }
    if (!indexNamesTicket.some(index => index.name === 'idx_ticket_company_id')) {
        await queryInterface.addIndex('Tickets', ['companyId'], { name: 'idx_ticket_company_id' });
    }
    if (!indexNamesTicket.some(index => index.name === 'idx_ticket_user_id')) {
        await queryInterface.addIndex('Tickets', ['userId'], { name: 'idx_ticket_user_id' });
    }
    if (!indexNamesTicket.some(index => index.name === 'idx_ticket_status')) {
        await queryInterface.addIndex('Tickets', ['status'], { name: 'idx_ticket_status' });
    }

    // Criação de índice para a tabela ContactTags
    if (!indexNamesContactTag.some(index => index.name === 'idx_contactTag_tagId')) {
        await queryInterface.addIndex('ContactTags', ['tagId'], { name: 'idx_contactTag_tagId' });
    }

    // Criação de índice para a tabela Queues
    if (!indexNamesQueue.some(index => index.name === 'idx_queues_id')) {
        await queryInterface.addIndex('Queues', ['id'], { name: 'idx_queues_id' });
    }

    // Criação de índice para a tabela Messages (para a coluna quotedMsgId)
    if (!indexNamesMessage.some(index => index.name === 'idx_message_quoted_id')) {
        await queryInterface.addIndex('Messages', ['quotedMsgId'], { name: 'idx_message_quoted_id' });
    }

    if (!indexNamesContact.some(index => index.name === 'idx_contact_id')) {
        await queryInterface.addIndex('Contacts', ['id'], { name: 'idx_contact_id' });
    }
    if (!indexNamesContact.some(index => index.name === 'idx_contact_company_id')) {
        await queryInterface.addIndex('Contacts', ['companyId'], { name: 'idx_contact_company_id' });
    }
    if (!indexNamesContact.some(index => index.name === 'idx_contact_whatsapp_id')) {
        await queryInterface.addIndex('Contacts', ['whatsappId'], { name: 'idx_contact_whatsapp_id' });
    }
    if (!indexNamesContactTag.some(index => index.name === 'idx_contactTag_contact_id')) {
        await queryInterface.addIndex('ContactTags', ['contactId'], { name: 'idx_contactTag_contact_id' });
    }
    if (!indexNamesContactTag.some(index => index.name === 'idx_contactTag_tag_id')) {
        await queryInterface.addIndex('ContactTags', ['tagId'], { name: 'idx_contactTag_tag_id' });
    }
    if (!indexNamesContact.some(index => index.name === 'idx_contact_name')) {
        await queryInterface.addIndex('Contacts', ['name'], { name: 'idx_contact_name' });
    }
    if (!indexNamesContact.some(index => index.name === 'idx_contact_number')) {
        await queryInterface.addIndex('Contacts', ['number'], { name: 'idx_contact_number' });
    }

  },

  down: async (queryInterface, Sequelize) => {
    // Remoção dos índices criados
    await queryInterface.removeIndex('Messages', 'idx_message_ticket_id');
    await queryInterface.removeIndex('Messages', 'idx_message_company_id');
    // Repita o mesmo padrão para os outros índices...

    await queryInterface.removeIndex('Tickets', 'idx_ticket_contact_id');
    await queryInterface.removeIndex('Tickets', 'idx_ticket_whatsapp_id');
    await queryInterface.removeIndex('Tickets', 'idx_ticket_queue_id');
    await queryInterface.removeIndex('Tickets', 'idx_ticket_id');
    await queryInterface.removeIndex('Tickets', 'idx_ticket_company_id');
    await queryInterface.removeIndex('Tickets', 'idx_ticket_user_id');
    await queryInterface.removeIndex('Tickets', 'idx_ticket_status');

    await queryInterface.removeIndex('ContactTags', 'idx_contactTag_tagId');

    await queryInterface.removeIndex('Queues', 'idx_queues_id');

    await queryInterface.removeIndex('Messages', 'idx_message_quoted_id');

    await queryInterface.removeIndex('Contacts', 'idx_contact_id');
    await queryInterface.removeIndex('Contacts', 'idx_contact_company_id');
    await queryInterface.removeIndex('Contacts', 'idx_contact_whatsapp_id');
    await queryInterface.removeIndex('Contacts', 'idx_contact_name');
    await queryInterface.removeIndex('Contacts', 'idx_contact_number');
    await queryInterface.removeIndex('ContactTags', 'idx_contactTag_contact_id');
    await queryInterface.removeIndex('ContactTags', 'idx_contactTag_tag_id');
  }
};
