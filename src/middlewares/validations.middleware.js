const { errorRes } = require("../models/response.model");

const createTenantVal = (req, res, next) => {
  if (!req.body.tenantId || !req.body.name) {
    return res.status(400).json(errorRes("Tenant Id and name are required"));
  }

  next();
};

const getTenantByIdVal = (req, res, next) => {
  if (!req.params) {
    return res.status(400).json(errorRes("Tenant Id is required"));
  }

  next();
};

const authRegisterVal = (req, res, next) => {
  const requiredFields = [
    "tenantId",
    "username",
    "email",
    "password",
    "role",
    "firstName",
    "mobile",
  ];
  const missingFields = [];

  requiredFields.forEach((el) => {
    if (!req.body?.[el]) {
      missingFields.push(el);
    }
  });
  if (missingFields.length) {
    return res.status(400).json(errorRes("Missing fields", { missingFields }));
  }

  next();
};

const createUserVal = (req, res, next) => {
  const requiredFields = [
    "tenantId",
    "username",
    "email",
    "password",
    "role",
    "firstName",
    "mobile",
  ];
  const missingFields = [];

  requiredFields.forEach((el) => {
    if (!req.body?.[el]) {
      missingFields.push(el);
    }
  });
  if (missingFields.length) {
    return res.status(400).json(errorRes("Missing fields", { missingFields }));
  }

  next();
};

const deleteEventVal = (req, res, next) => {
  const eventId = req.body?.eventId;

  if (!eventId) {
    return res.status(400).json(errorRes("eventId is required"));
  }
  next();
};

const loginValidation = (req, res, next) => {
  if (!req.body.tenantId) {
    return res.status(400).json(errorRes("Missing Tenant ID", {}));
  }
  if (!req.body.username || !req.body.password) {
    return res.status(400).json(errorRes("Missing fields", {}));
  }

  next();
};

const updateUserVal = (req, res, next) => {
  const { uid } = req.body;

  if (!req.body?.uid) {
    return res.status(400).json(errorRes("uid is required", uid));
  }

  next();
};

const createEventValidation = (req, res, next) => {
  const requiredFields = ["tenantUid", "eventName", "eventType", "scheduledAt"];
  const missingFields = [];

  requiredFields.forEach((el) => {
    if (!req.body?.[el]) {
      missingFields.push(el);
    }
  });

  if (missingFields.length) {
    return res.status(400).json(errorRes("Missing fields", { missingFields }));
  }
  next();
};

const createTaskVal = (req, res, next) => {
  const requiredFields = ["tenantUid", "eventUid", "title", "createdByUid"];
  const missingFields = [];

  requiredFields.forEach((el) => {
    if (!req.body?.[el]) {
      missingFields.push(el);
    }
  });
  if (missingFields.length) {
    return res.status(400).json(errorRes("Missing fields", { missingFields }));
  }

  next();
};

const eventUidValidation = (req, res, next) => {
  if (!req.query.tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }

  next();
};

module.exports = {
  createTenantVal,
  getTenantByIdVal,
  authRegisterVal,
  deleteEventVal,
  loginValidation,
  updateUserVal,
  createEventValidation,
  createTaskVal,
  eventUidValidation,
  createUserVal,
};
