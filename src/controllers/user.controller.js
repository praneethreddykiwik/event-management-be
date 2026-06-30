/** @format */

const tenantServices = require("../services/tenant.service");
const { successRes, errorRes } = require("../models/response.model");
const userServices = require("../services/user.service");
const utils = require("../utils/utils");
const {
  generateGetUsersReq,
  generateGetEventManagersReq,
  generateUpdateUserReq,
  generateUserEventsTasksReq,
  generateDeleteUserReq,
  generateCreateUserReq,
} = require("../models/requestModels/user.req.model");

const getUsersCtrl = async (req, res) => {
  try {
    const payload = generateGetUsersReq(req.query);

    const users = await userServices.getUsersService(payload);
    res.status(200).json(successRes("Success", users));
  } catch (error) {
    console.error("getUsersCtrl", error);
    const erorRes = errorRes("getUsers Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

const getEventManagersCtrl = async (req, res) => {
  try {
    const payload = generateGetEventManagersReq(req.query);

    const users = await userServices.getEventManagersService(payload);
    res.status(200).json(successRes("Success", users));
  } catch (error) {
    console.error("getEventManagersCtrl", error);
    const erorRes = errorRes("getUsers Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

const getUserById = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    success: true,
    data: { id, name: "Dummy User", role: "worker" },
  });
};

const createUser = (req, res) => {
  const { name, email, role } = req.body;

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: 3,
      name,
      email,
      role,
    },
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (email === "test@example.com" && password === "password") {
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: "fake-jwt-token",
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
};

const updateUserCtrl = async (req, res) => {
  try {
    const payload = generateUpdateUserReq(req.body);

    const { uid } = payload;

    if (!uid) {
      return res.status(400).json(errorRes("uid is required"));
    }

    const updatedUser = await userServices.updateUserService(payload);

    if (!updatedUser) {
      return res.status(404).json(errorRes("User not found"));
    }

    return res
      .status(200)
      .json(successRes("User updated successfully", updatedUser));
  } catch (error) {
    console.error("updateUserCtrl", error);
    return res
      .status(400)
      .json(errorRes(error.message || "Update failed", {}, error.code, error));
  }
};

const createUserCtrl = async (req, res) => {
  const {
    tenantId,
    username,
    email,
    password,
    role,
    firstName,
    lastName,
    mobile,
  } = req.body;
  try {
    const tenant = await tenantServices.getTenantByIdService(tenantId);
    if (!tenant) {
      const invalidTenantRes = errorRes("Tenant not found");
      return res.status(404).json(invalidTenantRes);
    }

    const tenantUid = tenant.uid;
    const passwordHash = await utils.hashPassword(password);

    const payload = generateCreateUserReq(
      tenantUid,
      username,
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      mobile,
    );
    const createUserRes = await userServices.createUserService(payload);
    console.log("createUserCtrl; createUserRes;", createUserRes);
    return res
      .status(201)
      .json(successRes("User Created Success", createUserRes));
  } catch (error) {
    console.error("createUserCtrl", error);
    const erorRes = errorRes("User Creation Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

const userEventsTasksCtrl = async (req, res) => {
  try {
    const payload = generateUserEventsTasksReq(req.query);

    const data = await userServices.userEventsTasksService(
      payload.tenantUid,
      payload.assignedToUid,
      payload.status,
    );

    const eventIds = data
      .map((el) => el.eventUid)
      .filter((fl, i, arr) => i === arr.findIndex((fi) => fi === fl));

    const countObj = {
      totalTaskCount: 0,
      notStarted: 0,
      assigned: 0,
      inProgress: 0,
      readyForQa: 0,
      qaInProgress: 0,
      completed: 0,
      cancelled: 0,
      deleted: 0,
    };

    const userEventsAndTasks = eventIds.map((eventId) => {
      const eventObj = data.find((fn) => fn.eventUid === eventId);
      const tasks = data
        .filter((fl) => fl.eventUid === eventId && fl.taskUid)
        .map((m) => {
          const countKey = utils.snakeToCamel(m.taskStatus);
          ++countObj[countKey];
          return {
            taskUid: m.taskUid,
            taskTitle: m.taskTitle,
            taskStatus: m.taskStatus,
            taskDescription: m.taskDescription,
            taskDueAt: m.taskDueAt,
            taskAssignedToUid: m.taskAssignedToUid,
            taskAssignedToFirstName: m.taskAssignedToFirstName,
            taskAssignedToLastName: m.taskAssignedToLastName,
            taskAssignedTo: m.taskAssignedTo,
            taskCreatedAt: m.taskCreatedAt,
            eventVenue: m.eventVenue,
            taskPriority: m.taskPriority,

            qaAssignedToUid: m.qaAssignedToUid,
            qaAssignedToFirstName: m.qaAssignedToFirstName,
            qaAssignedToLastName: m.qaAssignedToLastName,
            qaAssignedTo: m.qaAssignedTo,
            isQaApproved: m.isQaApproved,
          };
        });

      countObj.totalTaskCount += tasks.length;
      return {
        eventUid: eventObj.eventUid,
        eventName: eventObj.eventName,
        eventType: eventObj.eventType,
        evenScheduledAt: eventObj.evenScheduledAt,
        eventVenue: eventObj.eventVenue,
        expectedAttendees: eventObj.expectedAttendees,
        eventStatus: eventObj.eventStatus,
        eventAssignedToUid: eventObj.eventAssignedToUid,
        eventCreatedAt: eventObj.eventCreatedAt,
        eventAssignedToFirstName: eventObj.eventAssignedToFirstName,
        eventAssignedToLastName: eventObj.eventAssignedToLastName,
        eventAssignedToUsername: eventObj.eventAssignedToUsername,

        tasks,
      };
    });

    res
      .status(200)
      .json(successRes("Success", { countObj, data: userEventsAndTasks }));
  } catch (error) {
    console.error("userEventsTasksCtrl", error);
    const erorRes = errorRes(
      "userEventsTasksCtrl Failed",
      {},
      error.code,
      error,
    );
    return res.status(400).json(erorRes);
  }
};

const deleteUserCtrl = async (req, res) => {
  try {
    const payload = generateDeleteUserReq(req.query);

    if (!payload.uid) {
      return res.status(400).json(errorRes("uid is required"));
    }

    const deletedUser = await userServices.deleteUserService(payload.uid);

    return res
      .status(200)
      .json(successRes("User deleted successfully", deletedUser));
  } catch (error) {
    console.error("deleteUserCtrl", error);

    // PostgreSQL FK violation → user involved in tasks/events
    if (error.code === "23503") {
      return res
        .status(409)
        .json(errorRes("User is involved in events or tasks"));
    }

    return res.status(400).json(errorRes(error.message || "Delete failed"));
  }
};

module.exports = {
  getUsersCtrl,
  getUserById,
  createUser,
  loginUser,
  updateUserCtrl,
  createUserCtrl,
  userEventsTasksCtrl,
  deleteUserCtrl,
  getEventManagersCtrl,
};
