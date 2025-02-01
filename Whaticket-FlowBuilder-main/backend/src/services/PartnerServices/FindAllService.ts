import Partner from "../../models/Partner";

const FindAllService = async (): Promise<Partner[]> => {
  const records: Partner[] = await Partner.findAll({
    order: [["name", "ASC"]]
  });
  return records;
};

export default FindAllService;
