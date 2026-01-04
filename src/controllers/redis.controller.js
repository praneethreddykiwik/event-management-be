const { successRes, errorRes } = require("../models/response.model");
const {
  getSessionService,
  deleteSessionService,
} = require("../services/redis.service");

const getSessionCtrl = async (req, res) => {
  const user = await getSessionService(req.sessionID);
  if (user) {
    res.json(successRes("Success", { sessionID: req.sessionID, data: user }));
  } else {
    res.status(404).json(errorRes("Failed", { message: "User not in cache" }));
  }
};

const deleteSessionCtrl = async (req, res) => {
  try {
    const session = req.body.sessionID || req.sessionID;
    console.log("deleteSessionCtrl session", session);

    const user = await deleteSessionService(session);

    if (!user) {
      throw "User not in cache";
    }
    res.json(successRes("Session deleted!", { data: user }));
  } catch (error) {
    res.status(400).json(errorRes("Failed!", error));
  }
};

module.exports = { getSessionCtrl, deleteSessionCtrl };
