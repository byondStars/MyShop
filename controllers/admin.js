const Product = require("../models/product");
const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/filehelper");

exports.getProducts = (req, res, next) => {
  const userId = req.session.userId;
  let message = req.flash("message");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }

  Product.find({ userId: userId })
    .then((products) => {
      res.render("admin/products", {
        pageTitle: "Admin Products",
        path: "/admin/products",
        prods: products,
        message: message,
      });
    })
    .catch((err) => next(err));
};

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Edit Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errors.array()[0].msg,
    });
  }
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.session.userId;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: "Attached file is not an image.",
    });
  }

  const imageUrl = image.path;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: userId,
  });

  product
    .save()
    .then((result) => {
      req.flash("message", "product is added successfully");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      next(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const prodId = req.params.id;
  const editing = req.query.edit;

  Product.findById(prodId)
    .then((prod) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editing,
        product: prod,
        errorMessage: null,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then((product) => {
      if (image) {
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      return product.save();
    })
    .then((result) => {
      req.flash("message", "product is updated successfully");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error("Failed to update product");
      error.setStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        throw new Error("Product not found to delete");
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({_id:prodId}).then((result) => {
        req.flash("message", "product is deleted successfully");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      console.log("delete error", err);
      const error = new Error("Unable to delete product");
      error.setStatusCode = 500;
      return next(error);
    });
};
