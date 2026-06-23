const { errorRes, successRes } = require("../models/response.model");
const {
  generateBookmarkReq,
} = require("../models/requestModels/bookmark.req.model");
const services = require("../services/bookmark.service");

const bookmarkReqCtrl = async (req, res) => {
  try {
    const payload = generateBookmarkReq(req);
    console.log("payload", payload);
    const bookmarkEventRes = await services.bookmarkReqService(payload);
    res.status(200).json(successRes("Success", bookmarkEventRes));
  } catch (error) {
    console.error("bookmarkEventCtrl", error);
    const erorRes = errorRes("Bookmark Event Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

module.exports = { bookmarkReqCtrl };
