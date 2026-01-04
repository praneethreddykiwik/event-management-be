const { dummyUsersemail } = require("../../database");
const { successRes, errorRes } = require("../models/response.model");
const userServices = require("../services/user.service");

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

const updateUserCtrl = async (req, res) => {
  try {
    const { uid, mobile, status, role, username } = req.body;

    if (!uid) {
      return res.status(400).json(errorRes("uid is required"));
    }

    const updatedUser = await userServices.updateUserService({
      uid,
      mobile,
      status,
      role,
      username,
    });

    if (!updatedUser) {
      return res.status(404).json(errorRes("User not found"));
    }

    return res
      .status(200)
      .json(successRes("User updated successfully", updatedUser));
  } catch (error) {
    console.error("updateUserCtrl", error);
    return res
      .status(400)
      .json(errorRes(error.message || "Update failed", {}, error.code, error));
  }
};

module.exports = {
  getUsersCtrl,
  getUserById,
  createUser,
  loginUser,
  getMeCtrl,
  updateUserCtrl,
};
