const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const https = require("https");
require("dotenv").config();

//Auto RELOAD Page
// const livereload = require("livereload");
// const connectLiveReload = require("connect-livereload");
// const liveReloadServer = livereload.createServer();
// liveReloadServer.server.once("connection", () => {
//   setTimeout(() => {
//     liveReloadServer.refresh("/");
//   }, 100);
// });
///-----------------------------------------------

const app = express();

//Auto Reload Page
// app.use(connectLiveReload());
//------------------------------------------------

// const MONGO_URI = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.neu4z8y.mongodb.net/${process.env.MONGO_DB_NAME}`;
const MONGO_URI = `mongodb+srv://AwaisSharif:AgeebPassword123@cluster0.neu4z8y.mongodb.net/myshop`;

const myStore = new mongodbStore({
  uri: MONGO_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
app.use(express.static("public"));
// app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/images", express.static("images"));

app.set("views", "views");
app.set("view engine", "ejs");

app.use(
  session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false,
    store: myStore,
  })
);

app.use(csrfProtection);
app.use((req, res, next) => {
  console.log("session:", req.session.isLoggedIn);
  res.locals.isAuthenticated = req.session.isLoggedIn || false;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(flash());

const adminRoutes = require("./routes/admin");
const productRoutes = require("./routes/products");
const errorController = require("./controllers/errors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/admin", adminRoutes);
app.use(productRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use("/404", errorController.get404);

app.use((err, req, res, next) => {
  console.log("error 500: ", err);
  res.render("500", {
    pageTitle: "500 Page",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn || false,
  });
});

// const sslKey = fs.readFileSync(path.join(__dirname, "cert", "key.pem"));
// const sslCertificate = fs.readFileSync(
//   path.join(__dirname, "cert", "cert.pem")
// );

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    // https
    //   .createServer(
    //     {
    //       key: sslKey,
    //       cert: sslCertificate,
    //     },
    //     app
    //   )
    //   .listen(process.env.PORT || 3000, () => {
    //     console.log("listening...");
    //   });
    app.listen(process.env.PORT || 3000); //automatically set by hosting provider mostly.
    console.log("connected");
  })
  .catch((err) => console.log(err));
