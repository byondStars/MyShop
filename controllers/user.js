const User = require("../models/user");
const Product = require("../models/product");

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  const userId = req.session.userId;

  User.findById({ _id: userId })
    .then((user) => {
      const updatedItems = [...user.cart.items];
      const cartProductIndex = updatedItems.findIndex((cartProduct) => {
        return cartProduct.productId == prodId;
      });
      if (cartProductIndex >= 0) {
        updatedItems[cartProductIndex].quantity += 1;
      } else {
        updatedItems.push({ productId: prodId, quantity: 1 });
      }
      user.cart.items = updatedItems;
      return user.save().then((result) => {
        console.log("product is added to cart");
        res.redirect("/cart");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  const userId = req.session.userId;
  let user;

  User.findById(userId)
    .then((user) => {
      user = user;
      user
        .populate("cart.items.productId")
        .execPopulate()
        .then((user) => {
          const products = user.cart.items;
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};
