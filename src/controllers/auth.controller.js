const errorCodes = require("../constants/errorCodes.constants");
const reqModels = require("../models/request.model");
const { successRes, errorRes } = require("../models/response.model");
const tenantServices = require("../services/tenant.service");
const userServices = require("../services/user.service");
const utils = require("../utils/utils");

const registerCtrl = async (req, res) => {
  const { tenantId, username, email, password, role } = req.body;
  try {
    const tenant = await tenantServices.getTenantByIdService(tenantId);
    if (!tenant) {
      const invalidTenantRes = errorRes("Tenant not found");
      return res.status(404).json(invalidTenantRes);
    }

    const tenantUid = tenant.uid;
    const passwordHash = await utils.hashPassword(password);

    const payload = reqModels.createUserReqModel(
      tenantUid,
      username,
      email,
      passwordHash,
      role
    );
    const createUserRes = await userServices.createUserService(payload);
    console.log("registerCtrl; createUserRes;", createUserRes);
    return res
      .status(201)
      .json(successRes("Registration Success", createUserRes));
  } catch (error) {
    console.error("registerCtrl", error);
    const erorRes = errorRes("Registration Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

const loadUser = async (req, res, next) => {
  try {
    const { tenantId, username, password } = req.body;
    const query = { tenantId, username, password };

    const users = await userServices.getUsersService(
      query,
      "providePasswordHash"
    );

    if (!users || !users.length) {
      throw "User not found!";
    }

    const reqContext = req.ctx;
    const user = users[0];
    req.ctx = reqContext ? { ...reqContext, user } : { user };

    next();
  } catch (error) {
    console.log("loadUser error", error);
    const erorRes = errorRes("Something went wrong!", error);
    return res.status(400).json(erorRes);
  }
};

const authenticateUserCtrl = async (req, res, next) => {
  try {
    const { user } = req.ctx;

    const isValidPassword = await utils.comparePassword(
      req.body.password,
      user.password_hash
    );
    console.log("authenticateUserCtrl isValidPassword", isValidPassword);

    if (!isValidPassword) {
      throw "Invalid Credentials";
    }

    // never save password in session
    req.session.user = {
      uid: user.uid,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      tenantId: user.tenant_id,
    };

    console.log("authenticateUserCtrl success", {
      sessionData: req.session,
      user,
    });
    res.status(200).json(
      successRes("Login successful", {
        sessionID: req.sessionID,
      })
    );
    next();
  } catch (error) {
    console.error("authenticateUserCtrl", error);
    res.status(401).json(errorRes("Authentication failed", error));
  }
};

const logoutCtrl = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(400).json(errorRes("Logout failed"));
    }
    res.clearCookie("emdb.sid");
    // res.clearCookie(process.env.SESSION_COOKIE_NAME || "emdb.sid");
    return res.status(200).json(successRes("Logout successful"));
  });
};

const loadUserFromSessionCtrl = (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res
        .status(401)
        .json(errorRes("Unauthorized", "Please login", errorCodes.UN_AUTH));
    }

    return res
      .status(200)
      .json({ ...req.session.user, sessionID: req.sessionID });
  } catch (error) {
    return res
      .status(401)
      .json(errorRes("Unauthorized", error, errorCodes.UN_AUTH));
  }
};

module.exports = {
  registerCtrl,
  loadUser,
  authenticateUserCtrl,
  logoutCtrl,
  loadUserFromSessionCtrl,
};
