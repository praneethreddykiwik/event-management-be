const express = require("express");
const controllers = require("../controllers/tenant.controller");
const validations = require("../middlewares/validations.middleware");

const tenantRouter = express.Router();

tenantRouter.get("/", controllers.getAllTenants);
tenantRouter.get(
  "/:tenantId",
  validations.getTenantByIdVal,
  controllers.getTenantById,
);
tenantRouter.post(
  "/",
  validations.createTenantVal,
  controllers.createTenantCtrl,
);
tenantRouter.post("/event-managers", controllers.createManager);

module.exports = tenantRouter;
