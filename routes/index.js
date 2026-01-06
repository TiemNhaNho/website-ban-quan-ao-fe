const express = require("express");
const router = express.Router();

const homeController = require("../controllers/homeController");
const shopController = require("../controllers/shopController");
const productController = require("../controllers/productController");
const blogController = require("../controllers/blogController");

router.get("/", homeController.getHomePage);
router.get("/about", homeController.getAboutPage);
router.get("/contact", homeController.getContactPage);
router.get("/faqs", homeController.getFaqsPage);
router.get("/login", homeController.getLoginPage);
router.get("/error", homeController.getErrorPage);

router.get("/shop", shopController.getShopPage);
router.get("/shop-list", shopController.getShopListPage);
router.get("/cart", shopController.getCartPage);
router.get("/checkout", shopController.getCheckoutPage);
router.get("/wishlist", shopController.getWishlistPage);

router.get("/single-product", productController.getSingleProductPage);

router.get("/blog", blogController.getBlogPage);
router.get("/single-post", blogController.getSinglePostPage);

module.exports = router;
