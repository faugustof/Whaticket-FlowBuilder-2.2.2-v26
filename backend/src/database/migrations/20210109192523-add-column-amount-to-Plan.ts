import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
    up: (queryInterface: QueryInterface) => {
        return queryInterface.addColumn("Plans", "amount", {
            type: DataTypes.STRING,
        });
    },

    down: (queryInterface: QueryInterface) => {
        return queryInterface.removeColumn("Plans", "amount");
    }
};
