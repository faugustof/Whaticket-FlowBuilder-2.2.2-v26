import Setting from "../../models/Setting";

interface Request {
    key: string;
}

const GetSettingService = async ({
    key
}: Request): Promise<any | undefined> => {

    const setting = await Setting.findOne({
        where: {
            key
        }
    });
    if (setting === null) {
        return "enabled"
    }

    return setting;
};

export default GetSettingService;