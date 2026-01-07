const {
  createEventReqModel,
  acceptEventReqModel,
  declineEventReqModel,
} = require("../models/request.model");
const { successRes, errorRes } = require("../models/response.model");
const services = require("../services/event.service");

const deleteEventController = async (req, res) => {
  try {
    return res.status(200).json(successRes("Event deleted successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(successRes(err.message || "Internal server error", err));
  }
};

const getEventsCtrl = async (req, res) => {
  try {
    const obj = {
      tenantUid: req.query.tenantUid || req.session?.user?.tenantUid,
      eventUid: req.query.eventUid,
      assignedToUid: req.query.assignedToUid,
    };
    const getEventidRes = await services.getEventsService(obj);

    return res.status(200).json(successRes("success", getEventidRes));
  } catch (err) {
    console.error("getEventsCtrl", err);
    return res.status(400).json(errorRes("server is not responing", err));
  }
};

const createEventCtrl = async (req, res) => {
  try {
    const payload = createEventReqModel(req);
    const createEventRes = await services.createEventService(payload);
    res.status(200).json(successRes("Success", createEventRes));
  } catch (error) {
    console.error("createEventCtrl", error);
    const erorRes = errorRes("getUsers Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

const acceptEventCtrl = async (req, res) => {
  try {
    const payload = acceptEventReqModel(req);
    const acceptEventRes = await services.acceptEvent(payload);

    console.log("acceptEventRes", acceptEventRes);

    if (!acceptEventRes) {
      return res
        .status(409)
        .json(errorRes("Event cannot be accepted in current state"));
    }

    const { uid, tenant_uid, status, accepted_at } = acceptEventRes;

    const acceptEventResFields = {
      uid,
      tenant_uid,
      status,
      accepted_at,
    };

    return res.status(200).json(successRes("Success", acceptEventResFields));
  } catch (error) {
    console.error("acceptEvent", error);
    return res.status(400).json(errorRes("Accept Event Failed", error));
  }
};

const deleteEventCtrl = async (req, res) => {
  try {
    const payload = declineEventReqModel(req);
    const declineEventRes = await services.declineEvent(payload);

    console.log("accepEventres", declineEventRes);

    const { uid, tenant_uid, status, declined_at, decline_reason } =
      declineEventRes;

    const declineEventResFeilds = {
      uid,
      tenant_uid,
      status,
      declined_at,
      decline_reason,
    };

    res.status(200).json(successRes("Success", declineEventResFeilds));
  } catch (error) {
    console.error("declineError", error);
    const erorRes = errorRes("Accept Event Failed", error);
    return res.status(400).json(erorRes);
  }
};

const assignEventCtrl = async (req, res) => {
  try {
    const eventUid = req.body.eventUid;
    const assignedToUid = req.body.assignedToUid;
    const tenantUid = req.body.tenantUid || req.session?.user?.tenantUid;
    const updatedByUid = req.body.updatedByUid || req.session?.user?.uid;

    const createEventRes = await services.assignEventService(
      tenantUid,
      eventUid,
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

module.exports = {
  deleteEventController,
  createEventCtrl,
  getEventsCtrl,
  assignEventCtrl,
  acceptEventCtrl,
  deleteEventCtrl,
};
