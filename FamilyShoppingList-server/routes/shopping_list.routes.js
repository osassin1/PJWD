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
  
    router.get("/shopping_dates", shopping_list.getShoppingDates);
    router.get("/list", shopping_list.getList);
    router.get("/list_category", shopping_list.getListCategory);

    //router.get("/list_by_category", shopping_list.getListByCategory);

    router.get("/list_by_category_groupby", shopping_list.getListByCategoryGroupBy);

    router.post("/update_shopping_list", shopping_list.updateShoppingList);

    router.post("/log", shopping_list.logShoppingList)
    
    app.use('/api/shopping_list', router);
  };
  