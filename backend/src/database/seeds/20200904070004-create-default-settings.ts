import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const settings = [
      { key: "userCreation", value: "enabled" },
      { key: "hoursCloseTicketsAuto", value: "9999999999", companyId: "1" },
      { key: "chatBotType", value: "text", companyId: "1" },
      { key: "acceptCallWhatsapp", value: "enabled", companyId: "1" },
      { key: "userRandom", value: "enabled", companyId: "1" },
      { key: "sendGreetingMessageOneQueues", value: "enabled", companyId: "1" },
      { key: "sendSignMessage", value: "enabled", companyId: "1" },
      { key: "sendFarewellWaitingTicket", value: "disabled", companyId: "1" },
      { key: "userRating", value: "disabled", companyId: "1" },
      { key: "sendGreetingAccepted", value: "enabled", companyId: "1" },
      { key: "CheckMsgIsGroup", value: "enabled", companyId: "1" },
      { key: "sendQueuePosition", value: "enabled", companyId: "1" },
      { key: "scheduleType", value: "disabled", companyId: "1" },
      { key: "acceptAudioMessageContact", value: "enabled", companyId: "1" },
      { key: "enableLGPD", value: "disabled", companyId: "1" },
      { key: "requiredTag", value: "disabled", companyId: "1" },
      { key: "wtV", value: "disabled" }
    ];

    for (let setting of settings) {
      const exists = await queryInterface.rawSelect(
        "Settings",
        {
          where: {
            key: setting.key,
            ...(setting.companyId && { companyId: setting.companyId })
          }
        },
        ["id"]
      );

      if (!exists) {
        await queryInterface.bulkInsert(
          "Settings",
          [
            {
              ...setting,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ],
          {}
        );
      }
    }
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", null, {});
  }
};
