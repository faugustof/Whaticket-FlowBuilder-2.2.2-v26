import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.addColumn("Whatsapps", "expiresInactiveMessage", {
                type: DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "inactiveMessage", {
                type: DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "timeInactiveMessage", {
                type: DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "maxUseBotQueuesNPS", {
                type: DataTypes.INTEGER,
                defaultValue: 0
            }),
            queryInterface.addColumn("Whatsapps", "whenExpiresTicket", {
                type: DataTypes.STRING,
                defaultValue: ""
            }),
            queryInterface.addColumn("Whatsapps", "expiresTicketNPS", {
                type: DataTypes.STRING,
                defaultValue: ""
            })
        ]);
    },

    down: (queryInterface: QueryInterface) => {
        return Promise.all([
            queryInterface.removeColumn("Whatsapps", "expiresInactiveMessage"),
            queryInterface.removeColumn("Whatsapps", "inactiveMessage"),
            queryInterface.removeColumn("Whatsapps", "timeInactiveMessage"),
            queryInterface.removeColumn("Whatsapps", "maxUseBotQueuesNPS"),
            queryInterface.removeColumn("Whatsapps", "whenExpiresTicket"),
            queryInterface.removeColumn("Whatsapps", "expiresTicketNPS"),
        ]);
    }
};
