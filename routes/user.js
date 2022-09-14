const express = require("express");
const userController = require("../controllers/user");
const isAuth = require("../utils/isAuth");

const router = express.Router();

router.post("/cart", isAuth, userController.postCart);

router.get("/cart", isAuth, userController.getCart);

module.exports = router;
