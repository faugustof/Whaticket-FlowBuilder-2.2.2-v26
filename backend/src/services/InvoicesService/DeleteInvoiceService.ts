import Invoices from "../../models/Invoices";
import AppError from "../../errors/AppError";

const DeleteInvoiceService = async (id: string | number): Promise<void> => {
  const invoice = await Invoices.findOne({
    where: { id }
  });

  if (!invoice) {
    throw new AppError("ERR_NO_INVOICE_FOUND", 404);
  }

  await invoice.destroy();
};

export default DeleteInvoiceService;
