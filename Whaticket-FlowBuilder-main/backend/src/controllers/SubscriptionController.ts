import { Request, Response } from "express";
import * as Yup from "yup";
import Gerencianet from "gn-api-sdk-typescript";
import AppError from "../errors/AppError";

import options from "../config/Gn";
import Company from "../models/Company";
import Invoices from "../models/Invoices";
import { getIO } from "../libs/socket";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import Plan from "../models/Plan";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const gerencianet = new Gerencianet(options);

  return res.json(gerencianet.getSubscriptions());
};

export const createSubscription = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const gerencianet = new Gerencianet(options);
  const { companyId } = req.user;

  const schema = Yup.object().shape({
    price: Yup.string().required(),
    users: Yup.string().required(),
    plan: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const updateCompany = await Company.findOne({ where: { id: companyId } });
  const plan = await Plan.findOne({ where: { id: updateCompany.planId } });

  const { invoiceId } = req.body;

  const _price: any = plan.amount
  // const price: any = _price.toLocaleString("us-US", { minimumFractionDigits: 2 }).replace(",", ".")
  const price: any = formatter.format(_price).replace('$', '')

  const devedor: any = { nome: updateCompany.name }

  const doc = updateCompany.document.replace(/\D/g, "");

  if (doc.length === 11) {
    devedor.cpf = doc
  } else {
    devedor.cnpj = doc
  }

  const body = {
    calendario: {
      expiracao: 3600
    },
    devedor: {
      ...devedor
    },
    valor: {
      original: price
    },
    chave: process.env.GERENCIANET_CHAVEPIX,
    solicitacaoPagador: `#Fatura:${invoiceId}`
  };

  try {
    const pix = await gerencianet.pixCreateImmediateCharge(null, body);

    const qrcode = await gerencianet.pixGenerateQRCode({ id: pix.loc.id });

    if (!updateCompany) {
      throw new AppError("Company not found", 404);
    }

    // await updateCompany.update({
    //   name: firstName,
    //   document: zipcode,
    //   planId: plan.planId,
    // });

    return res.json({
      ...pix,
      qrcode
    });
  } catch (error) {
    console.log('error_subscription', error);
    throw new AppError("Validation fails", 400);
  }
};

export const createWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required(),
    url: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave, url } = req.body;

  const body = {
    webhookUrl: url
  };

  const params = {
    chave
  };

  try {
    const gerencianet = new Gerencianet(options);

    const create = await gerencianet.pixConfigWebhook(params, body);

    // const params1 = {
    //   inicio: '2022-12-20T00:01:35Z',
    //   fim: '2022-12-31T23:59:00Z',
    // };
    // const pixListWebhook = await gerencianet.pixListWebhook(params1);

    // const params2 = {
    //   chave: 'c5c0f5a4-efe2-447f-8c73-55f8c0f07284',
    // };
    // const pixDetailWebhook = await gerencianet.pixDetailWebhook(params2);

    return res.json(create);
  } catch (error) {
    console.log(error);
  }
};

export const deleteWebhook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const schema = Yup.object().shape({
    chave: Yup.string().required()
  });

  if (!(await schema.isValid(req.body))) {
    throw new AppError("Validation fails", 400);
  }

  const { chave } = req.body;

  const params = {
    chave
  };

  const gerencianet = new Gerencianet(options);

  const deleteWebhook = await gerencianet.pixDeleteWebhook(params);

  return res.json(deleteWebhook);
};

export const webhook = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const { type } = req.params;

  const { evento } = req.body;

  if (evento === "teste_webhook") {
    return res.json({ ok: true });
  }

  if (req.body.pix) {
    const gerencianet = new Gerencianet(options);

    req.body.pix.forEach(async (pix: any) => {

      const detalhe = await gerencianet.pixDetailCharge({ txid: pix.txid });

      if (detalhe.status === "CONCLUIDA") {
        const { solicitacaoPagador } = detalhe;

        const invoiceID = solicitacaoPagador.replace("#Fatura:", "");
        const invoices = await Invoices.findByPk(invoiceID);
        const companyId = invoices.companyId;
        const company = await Company.findByPk(companyId);

        const expiresAt = new Date(company.dueDate);
        expiresAt.setDate(expiresAt.getDate() + 30);
        const date = expiresAt.toISOString().split("T")[0];

        if (company) {

          await company.update({
            dueDate: date
          });

          const invoi = await invoices.update({
            id: invoiceID,
            status: 'paid'
          });

          await company.reload();

          const io = getIO();

          const companyUpdate = await Company.findOne({
            where: {
              id: companyId
            }
          });

          io.of(String(companyId))
  .emit(`company-${companyId}-payment`, {
            action: detalhe.status,
            company: companyUpdate
          });
        }

      }
    });
  }

  return res.json({ ok: true });
};
