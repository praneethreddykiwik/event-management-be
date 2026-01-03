const { successRes } = require("../models/response.model");

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

module.exports = { deleteEventController };
