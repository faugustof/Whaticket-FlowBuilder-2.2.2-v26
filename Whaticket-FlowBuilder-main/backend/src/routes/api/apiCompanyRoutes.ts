import express from "express";

import * as CompanyController from "../../controllers/api/CompanyController";
import * as PlanController from "../../controllers/api/PlanController";
import * as HelpController from "../../controllers/api/HelpController";
import * as PartnerController from "../../controllers/api/PartnerController";
import * as InvoicesController from "../../controllers/InvoicesController";
import * as UserController from "../../controllers/UserController";
import isAuthCompany from "../../middleware/isAuthCompany";

const apiCompanyRoutes = express.Router();

// PLANS
apiCompanyRoutes.get("/plans", isAuthCompany, PlanController.index);

apiCompanyRoutes.get("/plans/:id", isAuthCompany, PlanController.show);

apiCompanyRoutes.post("/plans", isAuthCompany, PlanController.store);

apiCompanyRoutes.put("/plans/:id", isAuthCompany, PlanController.update);

apiCompanyRoutes.delete("/plans/:id", isAuthCompany, PlanController.remove);

// COMPANY
apiCompanyRoutes.get("/companies", isAuthCompany, CompanyController.index);

apiCompanyRoutes.get("/companies/:id", isAuthCompany, CompanyController.show);

apiCompanyRoutes.get("/companiesEmail/:email", isAuthCompany, CompanyController.showEmail);

apiCompanyRoutes.post("/companies", isAuthCompany, CompanyController.store);

apiCompanyRoutes.put("/companies/:id", isAuthCompany, CompanyController.update);

apiCompanyRoutes.put("/companies/:id/schedules", isAuthCompany, CompanyController.updateSchedules);

apiCompanyRoutes.delete("/companies/:id", isAuthCompany, CompanyController.remove);

// HELP
apiCompanyRoutes.get("/helps", isAuthCompany, HelpController.index);

apiCompanyRoutes.get("/helps/:id", isAuthCompany, HelpController.show);

apiCompanyRoutes.post("/helps", isAuthCompany, HelpController.store);

apiCompanyRoutes.put("/helps/:id", isAuthCompany, HelpController.update);

apiCompanyRoutes.delete("/helps/:id", isAuthCompany, HelpController.remove);

+// PARTNER
apiCompanyRoutes.get("/partners", isAuthCompany, PartnerController.index);

apiCompanyRoutes.get("/partners/:id", isAuthCompany, PartnerController.show);

apiCompanyRoutes.post("/partners", isAuthCompany, PartnerController.store);

apiCompanyRoutes.put("/partners/:id", isAuthCompany, PartnerController.update);

apiCompanyRoutes.delete("/partners/:id", isAuthCompany, PartnerController.remove);


// INVOICES
apiCompanyRoutes.get("/invoices", isAuthCompany, InvoicesController.index);

apiCompanyRoutes.get("/invoices/:id", isAuthCompany, InvoicesController.show);

apiCompanyRoutes.get("/invoicesCompany/:companyId", isAuthCompany, InvoicesController.list);

apiCompanyRoutes.post("/invoices", isAuthCompany, InvoicesController.store);

apiCompanyRoutes.put("/invoices/:id", isAuthCompany, InvoicesController.update);

apiCompanyRoutes.delete("/invoices/:id", isAuthCompany, InvoicesController.remove);


// COMPANY
// apiCompanyRoutes.get("/users", isAuthCompany, UserController.index);

// apiCompanyRoutes.get("/users/:userId", isAuthCompany, UserController.show);

apiCompanyRoutes.get("/users/:email", isAuthCompany, UserController.showEmail);

// apiCompanyRoutes.post("/users", isAuthCompany, UserController.store);

// apiCompanyRoutes.put("/users/:userId", isAuthCompany, UserController.update);

// apiCompanyRoutes.delete("/users/:userId", isAuthCompany, UserController.remove);

export default apiCompanyRoutes;
