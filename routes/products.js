const express = require("express");
const productsController = require("../controllers/products");
const isAuth = require("../utils/isAuth");

const router = express.Router();

router.get('/',productsController.getProducts);

router.get('/products',productsController.getProductList);

router.get('/products/:id',productsController.getProductDetails);

router.post('/cart-delete-item',isAuth,productsController.deleteCartItem);

router.post('/create-order',isAuth,productsController.postCreateOrder);

router.get('/orders',isAuth,productsController.getOrders);

router.get('/orders/:orderId',isAuth,productsController.getInvoice);

module.exports = router;