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

const getEventsVal = (req, res, next) => {
  if (!req.query.tenantUid && !req.session?.user?.tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }

  next();
};

const getTasksByEventUidVal = (req, res, next) => {
  const eventUid = req.query.eventUid;
  const tenantUid = req.query.tenantUid || req.session?.user?.tenantUid;

  if (!eventUid) {
    return res.status(400).json(errorRes("Missing Event Uid", {}));
  }
  if (!tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }

  next();
};

const assignEventVal = (req, res, next) => {
  const eventUid = req.body.eventUid;
  const assignedToUid = req.body.assignedToUid;
  const tenantUid = req.body.tenantUid || req.session?.user?.tenantUid;
  const updatedByUid = req.body.updatedByUid || req.session?.user?.updatedByUid;

  if (!assignedToUid) {
    return res.status(400).json(errorRes("Missing assignedToUid", {}));
  }
  if (!eventUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }
  if (!tenantUid) {
    return res.status(400).json(errorRes("Missing username", {}));
  }
  if (!updatedByUid) {
    return res.status(400).json(errorRes("Missing updatedByUid", {}));
  }

  next();
};

const assignTaskVal = (req, res, next) => {
  const taskUid = req.body.taskUid;
  const assignedToUid = req.body.assignedToUid;
  const updatedByUid = req.body.updatedByUid || req.session?.user?.uid;

  if (!assignedToUid) {
    return res.status(400).json(errorRes("Missing Assigned To Uid", {}));
  }
  if (!taskUid) {
    return res.status(400).json(errorRes("Missing Task Uid", {}));
  }

  if (!updatedByUid) {
    return res.status(400).json(errorRes("Missing Updated By Uid", {}));
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
  getEventsVal,
  createUserVal,
  getTasksByEventUidVal,
  assignEventVal,
  assignTaskVal,
};
