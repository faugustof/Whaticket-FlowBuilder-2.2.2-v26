import Partner from "../../models/Partner";

const FindService = async (): Promise<Partner[]> => {
  const notes: Partner[] = await Partner.findAll({
    order: [["name", "ASC"]]
  });

  return notes;
};

export default FindService;
