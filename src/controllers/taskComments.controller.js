const { successRes, errorRes } = require("../models/response.model");
const {
  createTaskComment,
  getTaskComments,
  getTaskCommentByUid,
  updateTaskComment,
  deleteTaskComment,
} = require("../services/taskComments.service");

/**
 * body: {
 *   taskUid: ""
 * }
 */
const getTaskCommentsController = async (req, res, next) => {
  try {
    const { taskUid } = req.params;
    const tenantUid = req.session?.user?.tenantUid;

    const data = await getTaskComments({
      tenantUid,
      taskUid,
    });

    return res
      .status(200)
      .json(successRes("Comments fetched successfully", data));
  } catch (error) {
    next(error);
  }
};

/**
 * body: {
 *   taskUid: "",
 *   commentText: ""
 * }
 */
const createTaskCommentController = async (req, res, next) => {
  try {
    const { taskUid, commentText } = req.body;

    // Change sessionData to sessiondata if your app uses lowercase
    const tenantUid = req.session?.user?.tenantUid;
    const createdByUid = req.session?.user?.uid;
    const createdByName =
      req.session?.user?.firstName + req.session?.user?.lastName;

    const data = await createTaskComment({
      tenantUid,
      taskUid,
      commentText: commentText.trim(),
      createdByUid,
      createdByName,
    });

    return res
      .status(201)
      .json(successRes("Comment created successfully", data));
  } catch (error) {
    next(error);
  }
};

/**
    Not getting used
 * body: {
 *   taskUid: "",
 *   commentUid: ""
 * }
 */
const getTaskCommentByUidController = async (req, res, next) => {
  try {
    const { taskUid, commentUid } = req.body;

    const tenantUid =
      req.session?.user.tenantUid || req.session?.user.tenantUid;

    if (!tenantUid) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: session data missing",
      });
    }

    if (!taskUid) {
      return res.status(400).json({
        success: false,
        message: "Task uid is required",
      });
    }

    if (!commentUid) {
      return res.status(400).json({
        success: false,
        message: "Comment uid is required",
      });
    }

    const data = await getTaskCommentByUid({
      tenantUid,
      taskUid,
      commentUid,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Comment fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * body: {
 *   taskUid: "",
 *   commentUid: "",
 *   commentText: ""
 * }
 */
const updateTaskCommentController = async (req, res, next) => {
  try {
    const { taskUid, commentUid, commentText } = req.body;

    const tenantUid = req.session?.user.tenantUid;
    const updatedByUid = req.session?.user.userUid;

    const data = await updateTaskComment({
      tenantUid,
      taskUid,
      commentUid,
      commentText: commentText.trim(),
      updatedByUid,
    });

    if (!data) {
      return res
        .status(404)
        .json(errorRes("Comment not found or already deleted", {}));
    }

    return res
      .status(200)
      .json(successRes("Comment updated successfully", data));
  } catch (error) {
    next(error);
  }
};

/**
 * body: {
 *   taskUid: "",
 *   commentUid: ""
 * }
 */
const deleteTaskCommentController = async (req, res, next) => {
  try {
    const { taskUid, commentUid } = req.body;

    const tenantUid = req.session?.user.tenantUid;
    const deletedByUid = req.session?.user.userUid;

    const data = await deleteTaskComment({
      tenantUid,
      taskUid,
      commentUid,
      deletedByUid,
    });

    if (!data) {
      return res
        .status(404)
        .json(errorRes("Comment not found or already deleted"));
    }

    return res
      .status(200)
      .json(successRes("Comment deleted successfully", data));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTaskCommentController,
  getTaskCommentsController,
  getTaskCommentByUidController,
  updateTaskCommentController,
  deleteTaskCommentController,
};
