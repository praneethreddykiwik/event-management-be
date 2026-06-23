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

const getBookmarkByEntityCtrl = async (req, res) => {
  try {
    const payload = {
      entity_id: req.query.entity_id,
      entity_type: req.query.entity_type,
      user_id: req.session?.user?.uid,
    };

    console.log(payload);

    const data = await services.getBookmarkByEntityService(payload);

    return res.status(200).json(successRes(data));
  } catch (error) {
    console.error("getBookmarkByEntityCtrl error:", error);
    return res.status(500).json(errorRes("Failed to fetch bookmark"));
  }
};

module.exports = { bookmarkReqCtrl, getBookmarkByEntityCtrl };
