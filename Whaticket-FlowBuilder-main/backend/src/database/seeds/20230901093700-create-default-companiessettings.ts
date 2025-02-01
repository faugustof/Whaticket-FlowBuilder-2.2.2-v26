import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const settingsExist = await queryInterface.rawSelect('CompaniesSettings', {
      where: {
        companyId: 1,
      },
    }, ['companyId']);

    if (!settingsExist) {
      return queryInterface.bulkInsert("CompaniesSettings",
        [
          {
            companyId: 1,
            hoursCloseTicketsAuto: "9999999999",
            chatBotType: "text",
            acceptCallWhatsapp: "enabled",
            userRandom: "enabled",
            sendGreetingMessageOneQueues: "enabled",
            sendSignMessage: "enabled",
            sendFarewellWaitingTicket: "disabled",
            userRating: "disabled",
            sendGreetingAccepted: "enabled",
            CheckMsgIsGroup: "enabled",
            sendQueuePosition: "enabled",
            scheduleType: "disabled",
            acceptAudioMessageContact: "enabled",
            sendMsgTransfTicket: "enabled",
            enableLGPD: "disabled",
            requiredTag: "disabled",
            lgpdDeleteMessage: "disabled",
            lgpdHideNumber: "disabled",
            lgpdConsent: "disabled",
            lgpdLink: "",
            lgpdMessage: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            DirectTicketsToWallets: false,
            closeTicketOnTransfer: false
          }
        ],
        {}
      );
    }
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("CompaniesSettings", { companyId: 1 });
  }
};
