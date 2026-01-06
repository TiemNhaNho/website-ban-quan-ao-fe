exports.getHomePage = (req, res) => {
  res.render("index");
};

exports.getAboutPage = (req, res) => {
  res.render("about");
};

exports.getContactPage = (req, res) => {
  res.render("contact");
};

exports.getFaqsPage = (req, res) => {
  res.render("faqs");
};

exports.getLoginPage = (req, res) => {
  res.render("login");
};

exports.getErrorPage = (req, res) => {
  res.render("error");
};
