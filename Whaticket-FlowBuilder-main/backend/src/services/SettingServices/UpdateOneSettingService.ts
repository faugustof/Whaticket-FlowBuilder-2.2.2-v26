import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Request {
    key: string;
    value: string;
}

const UpdateOneSettingService = async ({
    key,
    value
}: Request): Promise<Setting | undefined> => {
    const [setting] = await Setting.findOrCreate({
        where: {
            key
        },
        defaults: {
            key,
            value
        }
    });

    if (!setting) {
        throw new AppError("ERR_NO_SETTING_FOUND", 404);
    }

    await setting.update({ value });

    return setting;
};

export default UpdateOneSettingService;