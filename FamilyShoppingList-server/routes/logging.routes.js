//const shopping_list = require("../models/shopping_list.js");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    const logging = require("../controllers/logging.controller.js");
  
    var router = require("express").Router();
  
    router.post("/log", logging.logEntry)
    
    app.use('/api/logging', router);
  };
  