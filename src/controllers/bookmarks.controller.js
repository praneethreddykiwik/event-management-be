const { errorRes, successRes } = require("../models/response.model");
const {
  generateBookmarkReq,
} = require("../models/requestModels/bookmark.req.model");
const services = require("../services/bookmark.service");

const bookmarkReqCtrl = async (req, res) => {
  try {
    const payload = generateBookmarkReq(req);
    const bookmarkEventRes = await services.bookmarkReqService(payload);
    res.status(200).json(successRes("Success", bookmarkEventRes));
  } catch (error) {
    console.error("bookmarkReqCtrl", error);
    const erorRes = errorRes("Bookmark Event Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

const getAllBookmarksByUserCtrl = async (req, res) => {
  try {
    const userId = req.session?.user?.uid;
    const data = await services.getAllBookmarksByUserService(userId);
    return res.status(200).json(successRes("Success", data));
  } catch (error) {
    console.error("getAllBookmarksByUserCtrl error:", error);
    return res.status(500).json(errorRes("Failed to fetch bookmarks"));
  }
};

module.exports = { bookmarkReqCtrl, getAllBookmarksByUserCtrl };
