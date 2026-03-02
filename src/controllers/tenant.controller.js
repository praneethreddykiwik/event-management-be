const { errorRes, successRes } = require("../models/response.model");
const services = require("../services/tenant.service");

async function getAllTenants(req, res) {
  try {
    const response = await services.fetchAllTenantsService();
    console.log("Success: getAllTenants response", response);
    return res.status(200).json(successRes("Tenants", response));
  } catch (error) {
    console.error("getAllTenants", error);
    const erorRes = errorRes("Get Tenants Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
}

async function getTenantById(req, res) {
  const { tenantId } = req.params;
  try {
    const tenant = await services.getTenantByIdService(tenantId);

    if (!tenant) {
      return res.status(404).json(errorRes("Tenant not found"));
    }

    return res.status(200).json(successRes("Success", tenant));
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
}

async function createTenantCtrl(req, res) {
  try {
    const response = await services.createTenantService(req);
    console.log("Success: createTenantCtrl response", response);
    return res.status(201).json(successRes("Tenant created", response));
  } catch (error) {
    console.error("createTenantCtrl", error);
    const erorRes = errorRes("", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
}

async function createManager(req, res) {
  try {
    const { email } = req.body;

    return res
      .status(200)
      .json(successRes("Manager created successfully", email));
  } catch (err) {
    return res
      .status(400)
      .json(errorRes(err.message || "internal server error", err));
  }
}

module.exports = {
  getAllTenants,
  getTenantById,
  createTenantCtrl,
  createManager,
};
