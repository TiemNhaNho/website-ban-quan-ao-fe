exports.getBlogPage = (req, res) => {
  res.render("blog");
};

exports.getSinglePostPage = (req, res) => {
  res.render("single-post");
};
