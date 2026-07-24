const generateBookmarkReq = (req) => {
  return {
    entityId: req.body.entityId,
    entityType: req.body.entityType,
    bookmarkName: req.body.bookmarkName,
    userId: req.session?.user?.uid,
  };
};

module.exports = {generateBookmarkReq};
