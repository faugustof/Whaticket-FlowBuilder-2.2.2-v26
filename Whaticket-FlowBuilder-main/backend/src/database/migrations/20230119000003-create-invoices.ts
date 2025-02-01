import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.createTable("Invoices", {
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
                onDelete: "SET NULL",
                allowNull: false
            },
            dueDate: {
                type: DataTypes.STRING,
            },
            detail: {
                type: DataTypes.STRING,
            },
            status: {
                type: DataTypes.STRING,
            },
            value: {
                type: DataTypes.FLOAT
            },
            users: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            connections: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            queues: {
                type: DataTypes.INTEGER,
                defaultValue: 0
            },
            useWhatsapp: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            useFacebook: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            useInstagram: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            useCampaigns: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            useSchedules: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            useInternalChat: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
            useExternalApi: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
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
        return queryInterface.dropTable("Invoices");
    }
};
