const { getDb } = require("../db/db");
const { successRes, errorRes } = require("../models/response.model");

const healthPost = (req, res) => {
  res.status(200).json({
    success: "success post call",
  });
};

const getHealth = async (req, res) => {
  try {
    const db = getDb();
    const response = await db.one("SELECT 1");
    const resDetails = {};
    console.log("Success: getHealth => controller =>", response);
    res.status(200).json(successRes("Success", resDetails));
  } catch (error) {
    console.log("Error: getHealth => controller =>", error);
    res
      .status(400)
      .json(errorRes("Failed", { status: "DOWN", error: error.message }));
  }
};

const deleteHealth = (req, res) => {
  res.status(200).json({
    success: "success delete call ",
  });
};

const patchHealth = (req, res) => {
  res.status(200).json({
    success: "success patch call ",
  });
};

const mainHealth = (req, res) => {
  console.log("/health working");
  res.status(200).json({ success: "Main health Working" });
};

module.exports = {
  healthPost,
  getHealth,
  deleteHealth,
  patchHealth,
  mainHealth,
};
