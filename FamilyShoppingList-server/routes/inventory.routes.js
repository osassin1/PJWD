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
    router.get("/no_picture", inventory.getNoPicture);

    router.get("/list_category", inventory.getListCategory);
    router.get("/list_of_stores", inventory.getListOfStores);
    router.get("/quantities", inventory.getQuantities);
    
    router.get("/inventory_by_store", inventory.getInventoryByStore);

    router.get("/inventory_by_store_for_edit", inventory.getInventoryByStoreForEdit);
    router.get("/inventory_by_store_for_edit_by_category", inventory.getInventoryByStoreForEditByCategory);

    
    router.get("/inventory_by_category", inventory.getInventoryByCategory);

    router.post("/update_inventory_item", inventory.updateInventoryItem);

    router.post("/create_inventory_item", inventory.createInventoryItem);
    router.post("/create_inventory_item_add_to_shoppinglist", 
                inventory.createInventoryItemAddToShoppingList);

    router.get("/check_inventory_for_deletion", inventory.checkInventoryForDeletion);

    router.post("/delete_inventory_item", inventory.deleteInventoryItem);
                    

    app.use('/api/inventory', router);
  };
  