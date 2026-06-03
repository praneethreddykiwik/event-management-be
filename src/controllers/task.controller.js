// const { utils } = require("pg-promise");
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
const utils = require("../utils/utils");

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

const qaEventsAndTasksCtrl = async (req, res) => {
  try {
    const tenantUid = req.query.tenantUid;
    const assignedToUid = req.query.assignedToUid;

    const data = await services.qaEventsAndTasksService(
      tenantUid,
      assignedToUid,
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

    const kpiCounts = {
      assignedToMe: 0,
      readyForQA: 0,
      QAInProgress: 0,
      approvedToday: 0,
      // rejectedToday: 0,
      pendingReview: 0,
    };

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
    };

    const userEventsAndTasks = eventIds.map((eventId) => {
      const eventObj = data.find((fn) => fn.eventUid === eventId);
      const tasks = data
        .filter((fl) => fl.eventUid === eventId && fl.taskUid)
        .map((m) => {
          const statusKey = utils.snakeToCamel(m.taskStatus);
          ++countObj[statusKey];

          const kpiConditions = {
            readyForQA: m.taskStatus === "ready_for_qa",
            QAInProgress: m.taskStatus === "qa_in_progress",
            approvedToday: utils.isToday(m.qa_approved_at),
            pendingReview:
              m.taskStatus === "ready_for_qa" ||
              m.taskStatus === "qa_in_progress",
          };
          for (const kpiKey in kpiConditions) {
            if (kpiConditions[kpiKey]) {
              kpiCounts[kpiKey] += 1;
            }
          }

          priorityCounts[m.taskPriority] += 1;

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
            taskUpdatedAt: m.taskUpdatedAt,
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
      kpiCounts.assignedToMe += tasks.length;

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

    res.status(200).json(
      successRes("Success", {
        countObj,
        kpiCounts,
        priorityCounts,
        data: userEventsAndTasks,
      }),
    );
  } catch (error) {
    console.error("qaEventsAndTasksCtrl", error);
    const erorRes = errorRes(
      "Qa Events and Tasks Failed",
      {},
      error.code,
      error,
    );
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
  qaEventsAndTasksCtrl,
};
