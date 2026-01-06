exports.getShopPage = (req, res) => {
  res.render("shop");
};

exports.getShopListPage = (req, res) => {
  res.render("shop-list");
};

exports.getCartPage = (req, res) => {
  res.render("cart");
};

exports.getCheckoutPage = (req, res) => {
  res.render("checkout");
};

exports.getWishlistPage = (req, res) => {
  res.render("wishlist");
};
