import AppError from "../../errors/AppError";
import CampaignSetting from "../../models/CampaignSetting";

interface Data {
  id: number | string,
  messageInterval: number | string,
  longerIntervalAfter: number | string,
  greaterInterval: number | string,
  variables: any[],
  sabado: boolean,
  domingo: boolean,
  startHour: string,
  endHour: string
}

const UpdateServiceCampaignSettings = async (data: Data): Promise<CampaignSetting> => {
  const { id } = data;

  const record = await CampaignSetting.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await record.update(data);

  // await record.reload({
  //   include: [
  //     { model: ContactList },
  //     { model: Whatsapp, attributes: ["id", "name"] }
  //   ]
  // });

  return record;
};

export default UpdateServiceCampaignSettings;
