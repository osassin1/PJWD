const inventory = require("../models/inventory.js");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    const inventory = require("../controllers/inventory.controller.js");
  
    var router = require("express").Router();
  
    //   // retrieve all family_members exclude 'password'
    // router.get("/", family_member.findAll);

    // // retrieve all family_members exclude 'password'
    // router.get("/colors", family_member.findAllColors);

    // // retrieve one family_members with 'password'
    // router.post("/login", family_member.login);
    
    router.get("/", inventory.getAllInventory);

    router.get("/picture", inventory.getPicture);

    app.use('/api/inventory', router);
  };
  