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


    //router.get("/list_by_category", shopping_list.getListByCategory);

    router.get("/list_by_category_groupby", shopping_list.getListByCategoryGroupBy);
    router.get("/list_by_category_groupby_cached", shopping_list.getListByCategoryGroupByCached);

    router.post("/update_shopping_list", shopping_list.updateShoppingList);

    router.post("/log", shopping_list.logShoppingList)
    
    // start, stop, and mark items shopped
    router.post("/change_shopping_status", shopping_list.changeShoppingStatus);

    router.post("/checkout_shopping_list", shopping_list.checkoutShoppingList);

    
    // router.post("/start_shopping", shopping_list.startShopping);
    // router.post("/stop_shopping", shopping_list.stopShopping);
    router.post("/shopped_item", shopping_list.shoppedItem);
    router.post("/un_shopped_item", shopping_list.unShoppedItem);
    router.get("/get_shopping_list_status", shopping_list.getShoppingListStatus);
    router.get("/get_shopped_item_status", shopping_list.getShoppedItemStatus);
    router.get("/get_all_shopping_list_status", shopping_list.getAllShoppingListStatus);

    
    app.use('/api/shopping_list', router);
  };
  