const generateBookmarkReq = (req) => {
  return {
    entity_id: req.body.entity_id,
    entity_type: req.body.entity_type,
    bookmark_name: req.body.bookmark_name,
    user_id: req.session?.user?.uid,
  };
};

module.exports = {generateBookmarkReq};
