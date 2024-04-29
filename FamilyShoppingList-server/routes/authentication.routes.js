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
  
    // Check if the oken is still valid and return
    // ture if so and false otherwise.
    router.get("/validate_token", authentication.validateToken);

    // Perform the login process with verifying the password
    // and generate a new token if successful
    router.post("/login", authentication.login);

    app.use('/api/authentication', router);
  };
  