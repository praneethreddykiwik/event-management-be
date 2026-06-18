const bookmarkEventReq = (req) => {
  return {
    uid: req.body.uid,
    type: req.body.type,
    bookmark: req.body.bookmark,
  };
};

module.exports = { bookmarkEventReq };
