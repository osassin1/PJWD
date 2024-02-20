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
  
    // router.get("/", inventory.getAllInventory);

    router.get("/picture", inventory.getPicture);

    router.get("/inventory_by_store", inventory.getInventoryByStore);
    router.get("/inventory_by_category", inventory.getInventoryByCategory);

    router.post("/create_inventory_item", inventory.createInventoryItem);
    router.post("/create_inventory_item_add_to_shoppinglist", 
                inventory.createInventoryItemAddToShoppingList);

    app.use('/api/inventory', router);
  };
  