import AppError from "../../errors/AppError";
import Integrations from "../../models/Integrations";

interface Request {
    integration: string | any;
    companyId: number | any;
    value: string | any;
}

const UpdateIntegrationsService = async ({
    integration,
    companyId,
    value
}: Request): Promise<Integrations | undefined> => {

    const integrations = await Integrations.findOne({
        where: { name: integration, companyId: companyId }
    });

    if (!integrations) {
        throw new AppError("ERR_NO_INTEGRATIONS_FOUND", 404);
    }

    await integrations.update({ token: value, where: { name: integration, companyId: companyId } });

    return integrations;
};

export default UpdateIntegrationsService;
