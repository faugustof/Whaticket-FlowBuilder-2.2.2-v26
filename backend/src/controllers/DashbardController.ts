import { Request, Response } from "express";
import DashboardDataService, { DashboardData, Params } from "../services/ReportService/DashbardDataService";
import { TicketsAttendance } from "../services/ReportService/TicketsAttendance";
import { TicketsDayService } from "../services/ReportService/TicketsDayService";
import TicketsQueuesService from "../services/TicketServices/TicketsQueuesService";

type IndexQuery = {
  initialDate: string;
  finalDate: string;
  companyId: number | any;
};

type IndexQueryPainel = {
  dateStart: string;
  dateEnd: string;
  status: string[];
  queuesIds: string[];
  showAll: string;
};
export const index = async (req: Request, res: Response): Promise<Response> => {
  const params: Params = req.query;
  const { companyId } = req.user;
  let daysInterval = 3;

  const dashboardData: DashboardData = await DashboardDataService(
    companyId,
    params
  );
  return res.status(200).json(dashboardData);
};

export const reportsUsers = async (req: Request, res: Response): Promise<Response> => {

  const { initialDate, finalDate, companyId } = req.query as IndexQuery

  const { data } = await TicketsAttendance({ initialDate, finalDate, companyId });

  return res.json({ data });

}

export const reportsDay = async (req: Request, res: Response): Promise<Response> => {

  const { initialDate, finalDate, companyId } = req.query as IndexQuery

  const { count, data } = await TicketsDayService({ initialDate, finalDate, companyId });

  return res.json({ count, data });

}

export const DashTicketsQueues = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId, profile, id: userId } = req.user;
  const { dateStart, dateEnd, status, queuesIds, showAll } = req.query as IndexQueryPainel;

  const tickets = await TicketsQueuesService({
    showAll: profile === "admin" ? showAll : false,
    dateStart,
    dateEnd,
    status,
    queuesIds,
    userId,
    companyId,
    profile
  });

  return res.status(200).json(tickets);
};