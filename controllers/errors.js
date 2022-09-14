exports.get404 = (req, res, next) => {
  const error = req.flash('error');
  res.render("404", {
    pageTitle: "404 Page",
    path: "/404",
    error:error[0],
  });
};

exports.get500 = (req, res, next) => {
  res.render("500", {
    pageTitle: "500 Page",
    path: "/500",
  });
};
