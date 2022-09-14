const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        pageTitle: "Products Page",
        path: "/",
        prods: products,
      });
    })
    .catch((err) => {
      // throw new Error("eror working");
      next(err);
    });
};
exports.getProductList = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        pageTitle: "Products List",
        path: "/products",
        prods: products,
      });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.id;
  Product.findById({ _id: prodId })
    .then((product) => {
      res.render("shop/product-detail", {
        pageTitle: "Product Details",
        path: "/product-details",
        product: product,
      });
    })
    .catch((err) => {
      return next(err);
    });
};

exports.deleteCartItem = (req, res, next) => {
  const prodId = req.body.productId;
  const userId = req.session.userId;
  User.findById(userId)
    .then((user) => {
      const prodIndex = user.cart.items.findIndex((prod) => {
        return prod.productId == prodId;
      });
      user.cart.items.splice(prodIndex, 1);
      return user.save().then((result) => {
        return user
          .populate("cart.items.productId")
          .execPopulate()
          .then((user) => {
            const products = user.cart.items;
            console.log("item is removed and cart updated");
            res.render("shop/cart", {
              pageTitle: "cart",
              path: "/cart",
              products: products,
            });
          });
      });
    })
    .catch((err) => {
      return next(err);
    });
};

exports.postCreateOrder = (req, res, next) => {
  const userId = req.session.userId;
  User.findById(userId)
    .then((user) => {
      user
        .populate("cart.items.productId")
        .execPopulate()
        .then((user) => {
          const products = user.cart.items.map((i) => {
            return { quantity: i.quantity, product: { ...i.productId._doc } };
          });
          const order = new Order({
            user: {
              email: user.email,
              userId: user,
            },
            products: products,
          });
          return order.save().then((result) => {
            user.cart.items = [];
            return user.save();
          });
        })

        .then(() => {
          res.redirect("/orders");
        });
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.session.userId })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.session.userId.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-----------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              " - " +
              prod.quantity +
              " x " +
              "$" +
              prod.product.price
          );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      pdfDoc.end();
    })
    .catch((err) => next(err));
};
