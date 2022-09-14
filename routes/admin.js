const express = require("express");
const isAuth = require("../utils/isAuth");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/products", isAuth, adminController.getProducts);

router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  [
    body("title","Title must be at least of 3 characters").isString().isLength({ min: 3 }).trim(),
    // body("imageUrl","Invalid Image Url").isURL(),
    body("price").isFloat().custom((value,{req})=>{

      if(value < 5.0){
        throw new Error("Price can't be less than 5");
      }
      return true;
    }),
    body("description","Description must be in range 5 to 400 characters").isString().isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

router.get("/edit-product/:id", isAuth, adminController.getEditProduct);

router.post("/edit-product", isAuth, adminController.postEditProduct);

router.post("/delete-product", isAuth, adminController.deleteProduct);

module.exports = router;
