const { errorRes, successRes } = require("../models/response.model");
const services = require("../services/tasks.service");

async function getEventsTasksCtrl(req, res) {
  try {
    const username = req.session?.user?.username;
    const tenantUid = req.session?.user?.tenantUid;
    console.log("getEventsTasksCtrl req", { tenantUid, username });

    const response = await services.getEventsTaskService(username, tenantUid);
    console.log("Success: getEventsTasksCtrl response", response);
    return res.status(200).json(successRes("Tasks", response));
  } catch (error) {
    console.error("getEventsTasksCtrl", error);
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
    createdByUid: req.body.createdByUid,
    updatedByUid: req.body.updatedByUid,
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

module.exports = {
  getEventsTasksCtrl,
  getTaskById,
  createTaskCtrl,
};
