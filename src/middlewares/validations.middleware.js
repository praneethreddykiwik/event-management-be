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
  const eventUid = req.body.eventUid;
  const tenantUid = req.body.tenantUid || req.session?.user?.tenantUid;
  const deletedByUid = req.body.deletedByUid || req.session?.user?.uid;

  if (!eventUid) {
    return res.status(400).json(errorRes("Missing Event Uid", {}));
  }
  if (!tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }
  if (!deletedByUid) {
    return res.status(400).json(errorRes("Missing Deleted By Uid", {}));
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
  const requiredFields = ["tenantUid", "eventUid", "title"];
  const missingFields = [];

  requiredFields.forEach((el) => {
    if (!req.body?.[el]) {
      missingFields.push(el);
    }
  });

  if (!req.body.createdByUid && !req.session.user.uid) {
    missingFields.push("createdByUid");
  }

  if (missingFields.length) {
    return res.status(400).json(errorRes("Missing fields", { missingFields }));
  }

  next();
};

const acceptEventVal = (req, res, next) => {
  const requiredFields = ["tenantUid", "eventUid", "eventManagerUid"];
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

const declineEventVal = (req, res, next) => {
  const requiredFields = [
    "tenantUid",
    "eventUid",
    "eventManagerUid",
    "declineReason",
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
  const updatedByUid = req.body.updatedByUid || req.session?.user?.uid;

  if (!assignedToUid) {
    return res.status(400).json(errorRes("Missing assignedToUid", {}));
  }
  // updatedByUid
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

const updateEventVal = (req, res, next) => {
  const eventUid = req.body.eventUid;
  const tenantUid = req.body.tenantUid || req.session?.user?.tenantUid;
  const updatedByUid = req.body.updatedByUid || req.session?.user?.uid;

  if (!eventUid) {
    return res.status(400).json(errorRes("Missing Event Uid", {}));
  }

  if (!tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }

  if (!updatedByUid) {
    return res.status(400).json(errorRes("Missing Updated By Uid", {}));
  }

  // fields allowed to update
  const updatableFields = [
    "eventName",
    "eventType",
    "scheduledAt",
    "assignedToUid",
    "status",
    "location",
    "description",
  ];

  const hasUpdatableField = updatableFields.some(
    (field) => req.body?.[field] !== undefined,
  );

  if (!hasUpdatableField) {
    return res.status(400).json(errorRes("No fields provided to update", {}));
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

const userEventsTasksVal = (req, res, next) => {
  const tenantUid = req.query.tenantUid || req.session?.user?.tenantUid;
  const assignedToUid = req.query.assignedToUid;

  if (!tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }
  if (!assignedToUid) {
    return res.status(400).json(errorRes("Missing User Uid", {}));
  }

  next();
};

const acceptTaskVal = (req, res, next) => {
  const taskUid = req.body.taskUid;
  const assignedToUid = req.body.assignedToUid || req.session?.user?.uid;

  if (!taskUid) {
    return res.status(400).json(errorRes("Missing Task Uid", {}));
  }
  if (!assignedToUid) {
    return res.status(400).json(errorRes("Missing User Uid", {}));
  }

  next();
};

const declineTaskVal = (req, res, next) => {
  const taskUid = req.body.taskUid;
  const declinedByUid = req.body.declinedByUid || req.session?.user?.uid;

  if (!taskUid) {
    return res.status(400).json(errorRes("Missing Task Uid", {}));
  }
  if (!declinedByUid) {
    return res.status(400).json(errorRes("Missing User Uid", {}));
  }

  next();
};

const editTaskVal = (req, res, next) => {
  const taskUid = req.body.taskUid;

  const updatedByUid = req.body.updatedByUid || req.session?.user?.uid;
  const tenantUid = req.body.tenantUid || req.session?.user?.tenantUid;

  if (!tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }
  if (!taskUid) {
    return res.status(400).json(errorRes("Missing Task Uid", {}));
  }
  if (!updatedByUid) {
    return res.status(400).json(errorRes("Missing Updated by Uid", {}));
  }

  next();
};

const deleteTaskVal = (req, res, next) => {
  const taskUid = req.body.taskUid;
  const declinedByUid = req.body.declinedByUid || req.session?.user?.uid;

  if (!taskUid) {
    return res.status(400).json(errorRes("Missing Task Uid", {}));
  }
  if (!declinedByUid) {
    return res.status(400).json(errorRes("Missing User Uid", {}));
  }

  next();
};

const qaEventsAndTasksVal = (req, res, next) => {
  const tenantUid = req.query.tenantUid || req.session?.user?.tenantUid;
  const assignedToUid = req.query.assignedToUid;

  if (!tenantUid) {
    return res.status(400).json(errorRes("Missing Tenant Uid", {}));
  }
  if (!assignedToUid) {
    return res.status(400).json(errorRes("Missing User Uid", {}));
  }

  next();
};

const getTaskByIdVal = (req, res, next) => {
  // checkHere
  next();
};

const getTaskCommentsVal = (req, res, next) => {
  const { taskUid } = req.params;

  const tenantUid = req.session?.user?.tenantUid;

  if (!tenantUid) {
    return res.status(401).json(errorRes("Tenant uid is required", {}));
  }

  if (!taskUid) {
    return res.status(400).json(errorRes("Task uid is required"));
  }

  next();
};

const createTaskCommentsVal = (req, res, next) => {
  const { taskUid, commentText } = req.body;

  // Change sessionData to sessiondata if your app uses lowercase
  const tenantUid = req.session?.user?.tenantUid;
  const createdByUid = req.session?.user?.uid;

  if (!tenantUid || !createdByUid) {
    return res.status(401).json(errorRes("Tenant uid is missing"));
  }

  if (!taskUid) {
    return res.status(400).json(errorRes("Task uid is required"));
  }

  if (!commentText || !commentText.trim()) {
    return res.status(400).json(errorRes("Comment text is required"));
  }
  next();
};

const updateTaskCommentsVal = (req, res, next) => {
  const { taskUid, commentUid, commentText } = req.body;

  const tenantUid = req.session?.user.tenantUid;
  const updatedByUid = req.session?.user.userUid;

  if (!tenantUid || !updatedByUid) {
    return res.status(401).json(errorRes("Tenant uid required"));
  }

  if (!taskUid) {
    return res.status(400).json(errorRes("Task uid is required"));
  }

  if (!commentUid) {
    return res.status(400).json(errorRes("Comment uid is required"));
  }

  if (!commentText || !commentText.trim()) {
    return res.status(400).json(errorRes("Comment text is required"));
  }

  next();
};

const deleteTaskCommentsVal = (req, res, next) => {
  const { taskUid, commentUid } = req.body;

  const tenantUid = req.session?.user.tenantUid;
  const deletedByUid = req.session?.user.userUid;

  if (!tenantUid || !deletedByUid) {
    return res.status(401).json(errorRes("Tenant uid required"));
  }

  if (!taskUid) {
    return res.status(400).json(errorRes("Task uid is required"));
  }

  if (!commentUid) {
    return res.status(400).json(errorRes("Comment uid is required"));
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
  updateEventVal,
  createUserVal,
  getTasksByEventUidVal,
  assignEventVal,
  assignTaskVal,
  acceptEventVal,
  declineEventVal,
  userEventsTasksVal,
  acceptTaskVal,
  declineTaskVal,
  editTaskVal,
  deleteTaskVal,
  qaEventsAndTasksVal,
  getTaskByIdVal,
  getTaskCommentsVal,
  createTaskCommentsVal,
  updateTaskCommentsVal,
  deleteTaskCommentsVal,
};
