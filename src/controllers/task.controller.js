const { errorRes, successRes } = require("../models/response.model");
const services = require("../services/tasks.service");

async function getTasksByEventUidCtrl(req, res) {
  try {
    const tenantUid = req.query.tenantUid || req.session?.user?.tenantUid;
    const eventUid = req.query.eventUid;

    console.log("getTasksByEventUidCtrl req", { tenantUid, eventUid });

    const response = await services.getTasksByEventService(tenantUid, eventUid);
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
  const payload = {
    tenantUid: req.body.tenantUid,
    eventUid: req.body.eventUid,
    title: req.body.title,
    description: null,
    priority: "medium",
    dueAt: null,
    assignedToUid: null,
    createdByUid: req.body.createdByUid || req.session.user.uid,
    updatedByUid: req.body.updatedByUid || req.session.user.uid,
  };
  console.log("shahid", payload);
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
    const tenantUid = req.body.tenantUid || req.session?.user?.tenantUid;
    const taskUid = req.body.taskUid;
    const updatedByUid = req.body.updatedByUid || req.session?.user?.uid;

    const response = await services.updateTaskService({
      tenantUid,
      taskUid,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      dueAt: req.body.dueAt,
      assignedToUid: req.body.assignedToUid,
      status: req.body.status,
      updatedByUid,
    });

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
      error
    );
    return res.status(400).json(errRes);
  }
}

const assignTaskCtrl = async (req, res) => {
  try {
    const taskUid = req.body.taskUid;
    const assignedToUid = req.body.assignedToUid;
    const updatedByUid = req.body.updatedByUid || req.session?.user?.uid;

    const createEventRes = await services.assignTaskService(
      taskUid,
      assignedToUid,
      updatedByUid
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
    const taskUid = req.body.taskUid;
    const assignedToUid = req.body.assignedToUid || req.session?.user?.uid;

    const createEventRes = await services.acceptTaskService(
      taskUid,
      assignedToUid
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
    const taskUid = req.body.taskUid;
    const declinedByUid = req.body.declinedByUid || req.session?.user?.uid;

    const createEventRes = await services.declineTaskService(
      taskUid,
      declinedByUid
    );
    res.status(200).json(successRes("Success", createEventRes));
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
};
