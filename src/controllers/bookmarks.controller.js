const {
  bookmarkEventReq,
} = require("../models/requestModels/bookmark.req.model");
const { errorRes, successRes } = require("../models/response.model");
const services = require("../services/event.service");

// const bookmarkEventCtrl = async (req, res) => {
//   try {
//     const payload = bookmarkEventReq(req);
//     const bookmarkEventRes = await services.bookmark(payload);
//     res.status(200).json(successRes("Success", bookmarkEventRes));
//   } catch (error) {
//     console.error("bookmarkEventCtrl", error);
//     const erorRes = errorRes("Bookmark Event Failed", {}, error.code, error);
//     return res.status(400).json(erorRes);
//   }
// };

const bookmarkEvent1Ctrl = async (req, res) => {
  try {
    // const payload = bookmarkEventReq(req);
    // const bookmarkEventRes = await services.bookmark(payload);

    res.status(200).json(successRes("Success"));
  } catch (error) {
    console.error("bookmarkEventCtrl", error);
    const erorRes = errorRes("Bookmark Event Failed", {}, error.code, error);
    return res.status(400).json(erorRes);
  }
};

module.exports = { bookmarkEvent1Ctrl };
