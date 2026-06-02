const { createTaskReqModel } = require("../models/request.model");
const {
  generateGetTasksByEventReq,
  generateUpdateTaskReq,
  generateAcceptTaskReq,
  generateAssignTaskReq,
  generateDeclineTaskReq,
  generateDeleteTaskReq,
} = require("../models/requestModels/tasks.req.model");
const { errorRes, successRes } = require("../models/response.model");
const services = require("../services/tasks.service");

async function getTasksByEventUidCtrl(req, res) {
  try {
    const payload = generateGetTasksByEventReq(req.query, req.session);

    console.log("getTasksByEventUidCtrl req", payload);

    const response = await services.getTasksByEventService(
      payload.tenantUid,
      payload.eventUid,
    );
    // console.log("getTasksByEventUidCtrl req", { tenantUid, eventUid });
    console.log("Success: getTasksByEventUidCtrl response", response);
    return res.status(200).json(successRes("Tasks", response));
  } catch (error) {
    console.error("getTasksByEventUidCtrl", error);
    const erorRes = errorRes("Get Tasks Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
}

async function getTaskById(req, res) {
  const { taskId } = req.params;
  try {
    const task = await services.getTaskByIdService(taskId);

    if (!task) {
      const invalidTaskRes = errorRes("Task not found");
      return res.status(404).json(invalidTaskRes);
    }

    return res.status(200).json(successRes("Success", task));
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
}

async function createTaskCtrl(req, res) {
  const payload = createTaskReqModel(req);
  try {
    const response = await services.createTaskService(payload);
    console.log("Success: createTaskCtrl response", response);
    return res.status(201).json(successRes("Task created", response));
  } catch (error) {
    console.error("createTaskCtrl", error);
    const erorRes = errorRes("", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
}

async function updateTaskCtrl(req, res) {
  try {
    const payload = generateUpdateTaskReq(req.body, req.session);

    const response = await services.updateTaskService(payload);

    if (!response) {
      return res.status(404).json(errorRes("Task not found"));
    }

    console.log("Success: updateTaskCtrl response", response);
    return res.status(200).json(successRes("Task updated", response));
  } catch (error) {
    console.error("updateTaskCtrl", error);
    const errRes = errorRes(
      error.message || "Failed to update task",
      {},
      error.code,
      error,
    );
    return res.status(400).json(errRes);
  }
}

const assignTaskCtrl = async (req, res) => {
  try {
    const payload = generateAssignTaskReq(req.body, req.session);

    const createEventRes = await services.assignTaskService(
      payload.taskUid,
      payload.assignedToUid,
      payload.updatedByUid,
    );
    res.status(200).json(successRes("Success", createEventRes));
  } catch (error) {
    console.error("assignEventCtrl", error);
    const erorRes = errorRes("Asssign Event Failed", error);
    return res.status(400).json(erorRes);
  }
};

const acceptTaskCtrl = async (req, res) => {
  try {
    const payload = generateAcceptTaskReq(req.body, req.session);

    const createEventRes = await services.acceptTaskService(
      payload.taskUid,
      payload.assignedToUid,
    );
    res.status(200).json(successRes("Success", createEventRes));
  } catch (error) {
    console.error("assignEventCtrl", error);
    const erorRes = errorRes("Asssign Event Failed", error);
    return res.status(400).json(erorRes);
  }
};

const declineTaskCtrl = async (req, res) => {
  try {
    const payload = generateDeclineTaskReq(req.body, req.session);

    const createEventRes = await services.declineTaskService(
      payload.taskUid,
      payload.declinedByUid,
    );
    res.status(200).json(successRes("Success", createEventRes));
  } catch (error) {
    console.error("assignEventCtrl", error);
    const erorRes = errorRes("Asssign Event Failed", error);
    return res.status(400).json(erorRes);
  }
};

const deleteTaskCtrl = async (req, res) => {
  try {
    const payload = generateDeleteTaskReq(req.body, req.session);

    const deleteTaskRes = await services.deleteTaskService(
      payload.tenantUid,
      payload.taskUid,
      payload.declinedByUid,
    );

    res.status(200).json(successRes("Success", deleteTaskRes));
  } catch (error) {
    console.error("assignEventCtrl", error);
    const erorRes = errorRes("Asssign Event Failed", error);
    return res.status(400).json(erorRes);
  }
};

module.exports = {
  getTasksByEventUidCtrl,
  getTaskById,
  createTaskCtrl,
  assignTaskCtrl,
  updateTaskCtrl,
  acceptTaskCtrl,
  declineTaskCtrl,
  deleteTaskCtrl,
};
