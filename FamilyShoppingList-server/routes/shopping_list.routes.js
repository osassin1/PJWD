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
  
    // This will retunr all shopping list that active for
    // a family by family_id. The shoppinglist.service uses
    // this as getAllDates.
    router.get("/shopping_dates", shopping_list.getShoppingDates);

    // Before a new shopping list can be created, check if it already
    // exists or existed in the past. The shoppinglist.service uses
    // this in checkShoppingDate(family_id: number, shopping_date: string, 
    // store_id: number)
    router.get("/check_shopping_date", shopping_list.checkShoppingDate);

    // The shopping list is devided into categories and the following
    // two requests return what's in thw shared family's shopping list
    // by family_id, the store by store_id, the category by list_category_id,
    // and the shopping date. The cached version will go against the server's
    // cache without hittin the database again.
    // The challenge with caches is that they become dirty (out-of-sync), however,
    // when a family member makes a change then the server cache will be
    // updated as well and the cache stays in-sync.
    router.get("/list_by_category_groupby", shopping_list.getListByCategoryGroupBy);
    router.get("/list_by_category_groupby_cached", shopping_list.getListByCategoryGroupByCached);

    // This either removes, updates or creates an inventory ietm
    // This is used by the shoppinglist.service as updateShoppingList(shopping_date: string,
    // family_member_id: number, inventory_id: number, quantity: number
    router.post("/update_shopping_list", shopping_list.updateShoppingList);

    // Shopping Process
    // 
    // The shopping process consists of start shopping, check if an item is in the cart,
    // and checkout at the register (pay for the items).
    //
    // The status of the shopping proces consists of:
    // 0  for shopping list is still worked on
    // 1  for shopping started (shop icon is clicked) and a check mark for an 
    //    item means it is in the cart (grayed on)
    // 2  for shopping is done (check icon is clicked)
    // 3  for at the register to pay and leave (after done icon is clicked,
    //    one needs to confirm that the shopping is done), which will mark
    //    all items on the list as shpping_status '3'
    router.post("/change_shopping_status", shopping_list.changeShoppingStatus);

    // This handels the checkout confirmation with changing shopping status
    // for inventory items on a list from 2->3 and 1->4:
    router.post("/checkout_shopping_list", shopping_list.checkoutShoppingList);

    // This return as specific status of a shopping list.
    router.get("/get_shopping_list_status", shopping_list.getShoppingListStatus);

    // This returns all curent shopping status within the system
    // and is not being used in shoppinglist.service.
    router.get("/get_all_shopping_list_status", shopping_list.getAllShoppingListStatus);

    // The shopping process includes get an item and put into the 
    // shopping cart (shopped_item) but also removing it from the cart
    // (un_shopped_item). These request change the shopping status.
    router.post("/shopped_item", shopping_list.shoppedItem);
    router.post("/un_shopped_item", shopping_list.unShoppedItem);
    router.get("/get_shopped_item_status", shopping_list.getShoppedItemStatus);
     
    app.use('/api/shopping_list', router);
  };
