import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addIndex("FlowBuilders", ["id", "user_id", "active"], {
        name: "idx_flowbui_id_user_id_active"
      }),
      queryInterface.addIndex("FlowCampaigns", ["id", "companyId", "phrase"], {
        name: "idx_flowcamp_id_company_id_phrase"
      }),
      queryInterface.addIndex("FlowDefaults", ["id", "companyId"], {
        name: "idx_flowdefa_id_company_id"
      })
    ]);
  },
  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeIndex(
        "FlowBuilders",
        "idx_flowbui_id_user_id_active"
      ),
      queryInterface.removeIndex(
        "FlowCampaigns",
        "idx_flowcamp_id_company_id_phrase"
      ),
      queryInterface.removeIndex("FlowDefaults", "idx_flowdefa_id_company_id")
    ]);
  }
};
