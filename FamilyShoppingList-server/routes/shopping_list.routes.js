const shopping_list = require("../models/shopping_list.js");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    const shopping_list = require("../controllers/shopping_list.controller.js");
  
    var router = require("express").Router();
  
    //   // retrieve all family_members exclude 'password'
    // router.get("/", family_member.findAll);

    // // retrieve all family_members exclude 'password'
    // router.get("/colors", family_member.findAllColors);

    // // retrieve one family_members with 'password'
    // router.post("/login", family_member.login);
    
    router.get("/shopping_dates", shopping_list.getShoppingDates);
    router.get("/list", shopping_list.getList);
    router.get("/list_category", shopping_list.getListCategory);
    router.get("/list_by_category", shopping_list.getListByCategory);


    
    app.use('/api/shopping_list', router);
  };
  