const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res, next) => {
  let errorMsg = req.flash("error");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }
  res.render("auth/login", {
    pageTitle: "Login Page",
    path: "/login",
    errorMessage: errorMsg,
    oldInput: { email: "", password: "" },
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
    });
  }
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid Email or Password");
        return res.redirect("/login");
      }

      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (!isMatch) {
          req.flash("error", "Invalid Password");
          return res.redirect("/login");
        }
        req.session.isLoggedIn = true;
        console.log("log in session:",req.session.isLoggedIn);
        req.session.userId = user._id;
        res.redirect("/");
      });
    })
    .catch((err) => {
      req.flash("error","Failed to login user");
      res.redirect("/404");
      // const error = new Error(err);
      // error.setStatusCode = 500;
      // return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    console.log("Logged out");
    return res.redirect("/login");
  });
};

exports.getSignup = (req, res, next) => {
  let errorMsg = req.flash("error");
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0];
  } else {
    errorMsg = null;
  }

  res.render("auth/signup", {
    pageTitle: "Signup Page",
    path: "/signup",
    errorMessage: errorMsg,
    oldInput: { email: "", password: "", confirmPassword: "" },
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }
  if (password !== confirmPassword) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup Page",
      path: "/signup",
      errorMessage: "Passwords not match",
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save().then((result) => {
        req.flash("error", "User Registered Successfully");
        res.redirect("/login");
      });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
