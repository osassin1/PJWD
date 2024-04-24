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
  
    // Load a picture from the inventory
    router.get("/picture", inventory.getPicture);
    
    // This returns all categories defined in the system
    router.get("/list_category", inventory.getListCategory);

    // This returns the list of stores defined in the system
    router.get("/list_of_stores", inventory.getListOfStores);

    // Load all available quantities from table quantity
    router.get("/quantities", inventory.getQuantities);
    
    // Get all inventory items for a store, so it can be
    // modified. This request also includes the 'pictures'
    // of the inventory items.
    router.get("/inventory_by_store_for_edit", inventory.getInventoryByStoreForEdit);

    // Same as the '/inventory_by_store_for_edit' request but 
    // with the additional condition of category
    router.get("/inventory_by_store_for_edit_by_category", inventory.getInventoryByStoreForEditByCategory);

    // Get, update, create inventory by category
    router.get("/inventory_by_category", inventory.getInventoryByCategory);
    router.post("/update_inventory_item", inventory.updateInventoryItem);
    router.post("/create_inventory_item", inventory.createInventoryItem);

    // Used to check if an item can be deleted when the trash
    // can icon is clicked.
    router.get("/check_inventory_for_deletion", inventory.checkInventoryForDeletion);

    // This will execute the deletion but checks again before that if
    // there are no more references. Once completed, the inventory needs to 
    // be updated and sync'ed with all other family members.
    router.post("/delete_inventory_item", inventory.deleteInventoryItem);

    app.use('/api/inventory', router);
  };
  