//const shopping_list = require("../models/shopping_list.js");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    const authentication = require("../controllers/authentication.controller.js");
  
    var router = require("express").Router();
  
    router.get("/validate_token", authentication.validateToken);
    router.post("/login", authentication.login);

    app.use('/api/authentication', router);
  };
  