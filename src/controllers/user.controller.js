const { dummyUsersemail } = require("../../database");
const { successRes, errorRes } = require("../models/response.model");
const updateUserServices = require("../services/user.service")

const getUsersCtrl = async (req, res) => {
  try {
    const users = await userServices.getUsersService(req.query);
    res.status(200).json(successRes("Success", users));
  } catch (error) {
    console.error("getUsersCtrl", error);
    const erorRes = errorRes("getUsers Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

const getUserById = (req, res) => {
  const { id } = req.params;

  res.status(200).json({
    success: true,
    data: { id, name: "Dummy User", role: "worker" },
  });
};

const createUser = (req, res) => {
  const { name, email, role } = req.body;

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      id: 3,
      name,
      email,
      role,
    },
  });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (email === "test@example.com" && password === "password") {
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: "fake-jwt-token",
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
};

const getMeCtrl = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json(errorRes("Not authenticated"));
  }
  return res.status(200).json(successRes("Current user", req.session.user));
};

const updateUserCtrl = (req, res) => {
  try {
    const { managerId, mobile, status } = req.body;
    const updatedManager = {
      managerId,
      mobile,
      status,
    };
    return res.status(200).json(successRes("Manager updated successfully", updatedManager));
  } catch (err) {
    return res.status(400).json(
      errorRes(err.message || "Update failed"));
  }
};

module.exports = { getUsersCtrl, getUserById, createUser, loginUser, getMeCtrl, updateUserCtrl };
