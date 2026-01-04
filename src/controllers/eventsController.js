const { createEventReqModel } = require("../models/request.model");
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

// reference users.controller
// aadil
const getEventByUidCtrl = () => {};

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

module.exports = { deleteEventController, createEventCtrl };
