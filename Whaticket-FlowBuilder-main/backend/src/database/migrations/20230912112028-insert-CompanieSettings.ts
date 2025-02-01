module.exports = {
  up: async (queryInterface) => {
    
    await queryInterface.sequelize.query(`
      do
        $$
      declare
        a record;
      begin
        for a in 
          select * from "Companies" c  where id not in (select "companyId" from "CompaniesSettings")
        loop
          insert into "CompaniesSettings" (
            "companyId",
            "hoursCloseTicketsAuto",
            "chatBotType",
            "acceptCallWhatsapp",
            "userRandom",
            "sendGreetingMessageOneQueues",
            "sendSignMessage",
            "sendFarewellWaitingTicket",
            "userRating",
            "sendGreetingAccepted",
            "CheckMsgIsGroup",
            "sendQueuePosition",
            "scheduleType",
            "acceptAudioMessageContact",
            "sendMsgTransfTicket",
            "enableLGPD",
            "requiredTag",
            "lgpdDeleteMessage",
            "lgpdHideNumber",
            "lgpdConsent",
            "lgpdLink",
            "lgpdMessage",
            "createdAt",
            "updatedAt",
            "DirectTicketsToWallets",
            "closeTicketOnTransfer"
          )
          values (
            a."id",
            '9999999999',
            'text',
            'enabled',
            'enabled',
            'enabled',
            'enabled',
            'enabled',
            'enabled',
            'enabled',
            'enabled',
            'enabled',
            'disabled',
            'enabled',
            'enabled',
            'disabled',
            'disabled',
            'disabled',
            'disabled',
            'disabled',
            '',
            '',
            current_timestamp,
            current_timestamp,
            false,
            false
          );
        end loop;
      end;
      $$`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DELETE FROM "CompaniesSettings" WHERE "companyId" <> 1');
  }
};
