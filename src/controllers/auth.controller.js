const errorCodes = require("../constants/errorCodes.constants");
const { successRes, errorRes } = require("../models/response.model");
const userServices = require("../services/user.service");
const utils = require("../utils/utils");

const loadUser = async (req, res, next) => {
  try {
    const { tenantId, username, password } = req.body;
    const query = { tenantId, username, password };

    const users = await userServices.getUsersService(
      query,
      "providePasswordHash",
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
      user.password_hash,
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
      tenantUid: user.tenantUid,
      firstName: user.firstName,
      lastName: user.firstName,
    };

    console.log("authenticateUserCtrl success", {
      sessionData: req.session,
      user,
    });
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json(errorRes("Session save error", err));
      }

      console.log("authenticateUserCtrl success", {
        sessionData: req.session,
        user,
      });

      res.status(200).json(
        successRes("Login successful", {
          sessionID: req.sessionID,
        }),
      );
      next();
    });
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
    console.log("loadUserFromSessionCtrl", {
      session: req.session,
      sessionUser: req.session.user,
    });

    if (!req.session || !req.session.user) {
      return res
        .status(401)
        .json(errorRes("Unauthorized", "Please login", errorCodes.UN_AUTH));
    }

    return res.status(200).json(
      successRes("Success", {
        ...req.session.user,
        sessionID: req.sessionID,
      }),
    );
  } catch (error) {
    return res
      .status(401)
      .json(errorRes("Unauthorized", error, errorCodes.UN_AUTH));
  }
};

module.exports = {
  loadUser,
  authenticateUserCtrl,
  logoutCtrl,
  loadUserFromSessionCtrl,
};
