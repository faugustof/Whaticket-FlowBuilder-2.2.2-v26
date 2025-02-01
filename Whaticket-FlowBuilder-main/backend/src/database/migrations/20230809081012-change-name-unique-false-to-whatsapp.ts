import { QueryInterface } from "sequelize";


//
//Bug encontrado: Uma empresa não pode criar uma conexão com o mesmo nome de outra empresa 
//dentro do saas o nome da conexão é tipo unique no Bd 
//Exemplo de caso de uso : Empresa A cria uma conexão chamada “Fixo”, 
//a empresa B não consegue criar uma conexão com o nome “Fixo”
//

module.exports = {
  up: async (queryInterface: QueryInterface ) => {
    const [results] = await queryInterface.sequelize.query(`
      SELECT *
      FROM information_schema.table_constraints
      WHERE constraint_name = 'Whatsapps_name_key'
        AND table_name = 'Whatsapps'
    `)
    if(results){
        await queryInterface.removeConstraint("Whatsapps", "Whatsapps_name_key");
        console.log(`A constraint Whatsapps_name_key foi removida da tabela Whatsapps.`);
      } else {
        console.log(`A constraint Whatsapps_name_key NÃO existe na tabela Whatsapps.`);
    }

  },

  down: async () => {

  }
};



