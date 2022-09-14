const express = require("express");
const authController = require("../controllers/auth");
const { body } = require("express-validator");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid Email").normalizeEmail(),
    body("password", "Invalid Password").isLength({ min: 5 }),
  ],
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            throw new Error("Email already registered");
          }
          return true;
        });
      }),

    body("password", "Password must have atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  authController.postSignup
);

module.exports = router;
