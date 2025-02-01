import { sendMessageFlow } from "../../controllers/MessageController";
import { WebhookModel } from "../../models/Webhook";
import { FlowBuilderModel } from "../../models/FlowBuilder";
import { randomString } from "../../utils/randomCode";
import CreateMessageService, {
  MessageData
} from "../MessageServices/CreateMessageService";
import { Request, Response } from "express";
import { ActionsWebhookService } from "./ActionsWebhookService";
import Whatsapp from "../../models/Whatsapp";

interface RequestLocal {
  companyId: number;
  hashId: string;
  data: any;
  req: Request;
}

export interface IConnections {
  source: string;
  sourceHandle: null | string;
  target: string;
  targetHandle: null | string;
  id: string;
}

interface IArrayOption {
  number: number
  value: string
}

export interface INodes {
  id: string;
  position: { x: number; y: number };
  data: { 
    label: string; 
    sec?: string
    message?: string
    arrayOption?: IArrayOption[]
  };
  type: string;
  style: { backgroundColor: string; color: string };
  width: number;
  height: number;
  selected: boolean;
  positionAbsolute: { x: number; y: number };
  dragging: boolean;
}

interface webhookCustom {
  config: null | {
    lastRequest: {};
    keys: {};
  };
}

const DispatchWebHookService = async ({
  companyId,
  hashId,
  data,
  req
}: RequestLocal): Promise<WebhookModel> => {
  try {
    const webhook = await WebhookModel.findOne({
      where: {
        company_id: companyId,
        hash_id: hashId
      }
    });

    const config = {
      ...webhook.config,
      lastRequest: {
        ...data
      }
    };

    const requestAll = webhook.requestAll + 1;

    const webhookUpdate = await WebhookModel.update(
      { config, requestAll },
      {
        where: { hash_id: hashId, company_id: companyId }
      }
    );

    if (webhook.config["details"]) {
      const flow = await FlowBuilderModel.findOne({
        where: {
          id: webhook.config["details"].idFlow
        }
      });
      const nodes: INodes[] = flow.flow["nodes"];
      const connections: IConnections[] = flow.flow["connections"];

      const nextStage = connections[0].source;

      const { count, rows } = await Whatsapp.findAndCountAll({
        where: {
          companyId: companyId
        }
      });

      const whatsappIds = [];
      rows.forEach(usuario => {
        whatsappIds.push(usuario.toJSON());
      });
      ActionsWebhookService(
        0,
        webhook.config["details"].idFlow,
        companyId,
        nodes,
        connections,
        nextStage,
        data,
        webhook.config["details"],
        hashId
      );
    }

    return webhook;
  } catch (error) {
    console.error("Erro ao inserir o usuário:", error);

    return error;
  }
};

export default DispatchWebHookService;
