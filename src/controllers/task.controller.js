const { errorRes, successRes } = require("../models/response.model");
const services = require("../services/tasks.service");

async function getTasksByEventUidCtrl(req, res) {
  try {
    const tenantUid = req.query.tenantUid || req.session?.user?.tenantUid;
    const eventUid = req.query.tenantUid;

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
async function updateTaskCtrl(req, res) {
  try {
    let { taskUid, tenantUid } = req.query;

    // Trim accidental newline (%0A issue)
    if (tenantUid) {
      tenantUid = tenantUid.trim();
    }
    if (taskUid) {
      taskUid = taskUid.trim();
    }

    const patch = {
      title: req.body.title || null,
      description: req.body.description || null,
      status: req.body.status || null,
      priority: req.body.priority || null,
      dueAt: req.body.dueAt || null,
      assignedToUid: req.body.assignedToUid || null,
    };

    const actorUid = req.body.updatedByUid;

    console.log("Update Task Input:", {
      tenantUid,
      taskUid,
      patch,
      actorUid,
    });

    const response = await services.updateTask(
      tenantUid,
      taskUid,
      patch,
      actorUid
    );

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
    const assignedToUid = req.body.assignedToUid || req.body.session?.user?.uid;

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
    const declinedByUid = req.body.declinedByUid || req.body.session?.user?.uid;

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
