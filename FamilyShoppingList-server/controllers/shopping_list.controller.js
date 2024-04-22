const { Sequelize } = require("sequelize");
const db = require("../models");
const { Map, List, Set } = require('immutable');
const ShoppingKey = require('../helper/shopping_key')
const ListByCategoryKey = require('../helper/list_by_category_key')
const shopping_list = db.shopping_list;
const Op = db.Sequelize.Op;

// This maintains the shopping process status for 
// all families, stores and dates. The ShoppingKey
// identifies a specific shopping list.
let shoppingMap = new Map();

// This keeps track what is currently in the shopping cart
// while family members are shopping together.
let shoppingInventory = new Map();

// This is a cach of all active shopping lists
// by category for all families of the system.
let listByCategory = new Map();


// This request will do three different functions:
// (1) it will actually delete an item from the shopping list if the quantity 
//     for that item is set to 0,
// (2) it will update the quantity for an existing item, or
// (3) it will create a new entry in the shopping list.
//
// Removing an item is simply done by setting its quantity to 0. And
// if an update of the quantity fails (0 rows updated) then create
// a new one.
exports.updateShoppingList = (req, res) => {
  // if quantity is 0 then remove the item from
  // the shopping list otherwise update the quantity
  // or insert a new item
  if (req.body.quantity == 0) {
    shopping_list.destroy({
      where: {
        shopping_date: req.body.shopping_date,
        family_member_id: req.body.family_member_id,
        inventory_id: req.body.inventory_id
      }
    }).then(result => {
      res.status(200).send();

    }).catch(error_find_one => {
      console.error('error_find_one', error_find_one);
      res.status(500).send({
        message: error_find_one.message || "error while removing item during updating shopping list."
      })
    })
  }
  else {
    shopping_list.update({
      quantity: req.body.quantity
    }, {
      where: {
        shopping_date: req.body.shopping_date,
        family_member_id: req.body.family_member_id,
        inventory_id: req.body.inventory_id
      }
    }).then(result => {
      // no updates performed, so enter it (create a new record)
      if (result == 0) {
        shopping_list.build({
          shopping_date: req.body.shopping_date,
          family_member_id: req.body.family_member_id,
          inventory_id: req.body.inventory_id,
          quantity: req.body.quantity,
          shopping_status_id: 1,  // status is 'open'
          created_at: new Date(),
          updated_at: new Date()
        }).save().then(insertResult => {
          res.send(insertResult);
        }).catch(error_insert => {
          res.status(500).send({
            message: error_insert.message || "error while inserting during updating shopping list."
          })
        })
      } else {
        res.send(result);
      }
    }).catch(error_update => {
      res.status(500).send({
        message: error_update.message || "error while updating shopping list."
      })
    })
  }
};

// This returns all active shopping lists for a family
// using the family_id. Note that the shopping status < 3 means
// that only active lists with inventory items will be returned.
// 
// Using the sequelize object with limiting the associations
// was not feasible and, therefore, a native SQL query was
// used.
exports.getShoppingDates = (req, res) => {
  db.sequelize.query(
    `SELECT DISTINCT shopping_list.shopping_date, family_member.family_id AS family_id, 
          store.store_id AS store_id, 
          store.name AS name 
          FROM shopping_list INNER JOIN family_member ON shopping_list.family_member_id = family_member.family_member_id
          AND family_member.family_id = ${req.query.family_id} 
          LEFT OUTER JOIN inventory AS shopping_list_to_inventory ON shopping_list.inventory_id = shopping_list_to_inventory.inventory_id
          LEFT OUTER JOIN store ON store.store_id = shopping_list_to_inventory.store_id
          WHERE shopping_list.shopping_status_id < 3 ORDER BY shopping_list.shopping_date ASC;`
  ).then(data => {
    res.send(data[0]);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving shopping dates."
      });
    });
};

// Check if a date/store combiantion was or is already in use
// by a family. If not then the family can use it otherwise not.
exports.checkShoppingDate = (req, res) => {
  db.sequelize.query(
    `SELECT DISTINCT 
    shopping_list.shopping_date AS shopping_date, 
    family_member.family_id AS family_id, 
    store.store_id AS store_id, 
    store.name AS name 
    FROM shopping_list INNER JOIN family_member ON shopping_list.family_member_id = family_member.family_member_id
    AND family_member.family_id = ${req.query.family_id} 
    LEFT OUTER JOIN inventory AS shopping_list_to_inventory ON shopping_list.inventory_id = shopping_list_to_inventory.inventory_id
    LEFT OUTER JOIN store ON store.store_id = shopping_list_to_inventory.store_id
    WHERE shopping_list.shopping_date = '${req.query.shopping_date}' AND store.store_id = ${req.query.store_id};`
  ).then(data => {
    res.send(data[0]);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while checking a shopping date."
      })
    })
}

// This is the cached version of the 'getListByCategoryGroupBy' request
// and retrieves from the server cache instead of going to the database
// directly. The data has been formated in the correct way and it's an easy 
// look up in the 'listByCategory' map.
exports.getListByCategoryGroupByCached = (req, res) => {
  let listByCategoryKey = new ListByCategoryKey(
    req.query.shopping_date,
    req.query.store_id,
    req.query.family_id,
    req.query.list_category_id);
  res.send(listByCategory.get(listByCategoryKey.key()));
}

// This request operates on the 'shopping_list' table and processes a request
// based on shopping_date (when), store (where), family_id (who), and category (what).
// It refelcts the shopping list UI. Only inventory items that are still actively
// shopped on (shopping_status < 3) will be returned ordered by name of the
// inventory item. Note: pictures will not be returned in this request as this
// will be called too many times and providing the picture for any changes would
// be too much (load and time).
exports.getListByCategoryGroupBy = (req, res) => {
  shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
    attributes: ['shopping_date', 'family_member_id', 'quantity', 'inventory_id', 'shopping_status_id',
      '`shopping_list_to_inventory`.`name`'],
    include: [{
      association: 'shopping_list_to_family_member', attributes: ['first_name', 'last_name', 'color_id'],
      where: { family_id: req.query.family_id },
      include: { association: 'family_member_to_color', attribute: ['name', 'color_id'] }
    }, {
      association: 'shopping_list_to_inventory',
      attributes: ['name', 'list_category_id', 'quantity_id', 'notes'],
      include: [{ association: 'inventory_to_store', attributes: ['store_id'] },
      { association: 'inventory_to_list_category', attributes: ['name'] },
      { association: 'inventory_to_quantity', attribues: ['name', 'unit', 'symbol'] }],
      exclude: ['picture'],
      where: {
        store_id: req.query.store_id,
        list_category_id: req.query.list_category_id
      }
    }],
    where: {
      shopping_date: req.query.shopping_date,
      shopping_status_id: {
        [Op.lt]: 3    // on get active shopping lists status_id 3 and 4 means, they are done
      }
    },
    order: [
      ['shopping_list_to_inventory', 'name', 'ASC']
    ]
  }).then(data => {

    // The map reduces the number of entries to one, eliminating duplicates. 
    // For example, two family members can enter the same item independently, 
    // to display them it is better to reduce I to one entry. 
    var newInventoryData = Map();
    var colorForCategory = new List();
    var categoryName = "";
    var categoryTotalNumOfItems = 0;

    data.forEach(x => {
      colorForCategory = colorForCategory.push(x['shopping_list_to_family_member']['family_member_to_color']['name']);
      if (categoryName.length == 0) {
        categoryName = x['shopping_list_to_inventory']['inventory_to_list_category']['name'];
      }
      categoryTotalNumOfItems++;

      // Prune the inventory data to something easier to handle
      if (!newInventoryData.has(x['inventory_id'])) {
        newInventoryData = newInventoryData.set(x['inventory_id'], {
          'num_of_items': 1,
          'quantity': x['quantity'],
          'shopping_status_id': x['shopping_status_id'],
          'inventory_id': x['inventory_id'],
          'name': x['shopping_list_to_inventory']['name'],
          'notes': x['shopping_list_to_inventory']['notes'],
          'picture': "no_picture.jpg",
          'symbol': x['shopping_list_to_inventory']['inventory_to_quantity']['symbol'],
          'unit': x['shopping_list_to_inventory']['inventory_to_quantity']['unit'],
          'family_members': [{
            'name': x['shopping_list_to_family_member']['family_member_to_color']['name'],
            'quantity': x['quantity'],
            'first_name': x['shopping_list_to_family_member']['first_name'],
            'last_name': x['shopping_list_to_family_member']['last_name'],
            'family_member_id': x['family_member_id'],
          }]
        });
      }
      else {
        var y = newInventoryData.get(x['inventory_id']);
        var family_member_array = y['family_members'];

        family_member_array.push(
          {
            'name': x['shopping_list_to_family_member']['family_member_to_color']['name'],
            'quantity': x['quantity'],
            'first_name': x['shopping_list_to_family_member']['first_name'],
            'last_name': x['shopping_list_to_family_member']['last_name'],
            'family_member_id': x['family_member_id'],
          });

        newInventoryData = newInventoryData.set(x['inventory_id'], {
          'num_of_items': y['num_of_items'] + 1,
          'quantity': parseFloat(y['quantity']) + parseFloat(x['quantity']),
          'shopping_status_id': x['shopping_status_id'],
          'inventory_id': x['inventory_id'],
          'name': y['name'],
          'notes': y['notes'],
          'picture': y['picture'],
          'symbol': y['symbol'],
          'unit': y['unit'],
          'family_members': family_member_array
        });
      }
    });

    var categoryTotal = {
      'category_name': categoryName,
      'total_num_of_items': categoryTotalNumOfItems,
      'family_members': colorForCategory.toOrderedSet().toList() // this makes it unique colors
    };
    var returnData = {
      'category': categoryTotal,
      'inventory': newInventoryData.toOrderedSet().toArray()
    };

    let listByCategoryKey = new ListByCategoryKey(req.query.shopping_date, req.query.store_id, req.query.family_id, req.query.list_category_id);
    listByCategory = listByCategory.set(listByCategoryKey.key(), returnData);
    res.send(returnData);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving getListByCategoryGroupBy."
      })
    })
}

// Shopping Process
//
// Get the status of the shopping activity for a family,
// date and store. The status is not persistent and only
// available during the life of the server. At restart,
// the process is reset.
exports.getShoppingListStatus = (req, res) => {

  shopping_date = req.query.shopping_date;
  store_id = parseInt(req.query.store_id);
  family_id = parseInt(req.query.family_id);

  let key = new ShoppingKey(shopping_date, store_id, family_id);

  let status = 0;
  if (shoppingMap.has(key.key())) {
    status = shoppingMap.get(key.key());
  }

  let response = `{ "key": ${key.key()}, "status": ${status}}`
  res.send(response);
}

// This returns all curent shopping status within the system
exports.getAllShoppingListStatus = (req, res) => {
  let response = shoppingMap.toJSON();
  res.send(response);
}

// Change the status of the in-process memory (Map) activity
// of the shopping process. Valid values are 0,1,2,3
exports.changeShoppingStatus = (req, res) => {
  shopping_date = req.body.shopping_date;
  store_id = parseInt(req.body.store_id);
  family_id = parseInt(req.body.family_id);
  shopping_status = req.body.shopping_status;

  let key = new ShoppingKey(shopping_date, store_id, family_id);
  shoppingMap = shoppingMap.set(key.key(), shopping_status);

  res.status(200).send();
}

// The checkout step changes the shopping status of the
// inventory items in the shopping list. Items that are purchased (they 
// have a status of 2 - being in the cart) and will get a status
// of 3. While items that were not in the cart (status 1) will get 
// a status of 4 (not purchased).
exports.checkoutShoppingList = (req, res) => {
  shopping_date = req.body.shopping_date;
  store_id = parseInt(req.body.store_id);
  family_id = parseInt(req.body.family_id);

  let key = new ShoppingKey(shopping_date, store_id, family_id);
  shoppingMap = shoppingMap.delete(key.key());

  // The purchased items' status changes from 2 -> 3
  shopping_list.update({
    shopping_status_id: 3
  }, {
    where: {
      shopping_date: shopping_date,
      shopping_status_id: 2,
      family_member_id: {
        [Op.in]: Sequelize.literal(`(select family_member_id from family_member where family_id=${family_id})`)
      }
    }
  }).then(sl => {
    if (sl) {
      res.status(200).send();
    } else {
      res.status(500).send({
        message: "error during checkout shopping list."
      });
    }
  })

  // The not purchased items' status changes from 1 -> 4
  shopping_list.update({
    shopping_status_id: 4
  }, {
    where: {
      shopping_date: shopping_date,
      shopping_status_id: 1,
      family_member_id: {
        [Op.in]: Sequelize.literal(`(select family_member_id from family_member where family_id=${family_id})`)
      }
    }
  }).then(sl => {
    if (sl) {
      res.status(200).send();
    } else {
      res.status(500).send({
        message: "error while checkout shopping list."
      });
    }
  })
}

// Shopping Inventory Items
//
// This moves an inventory item from the list into the shopping cart
// by changing the shopping_status from '1' to '2'. The item is now
// in the cart. While doing this, the server keeps track of what is in
// the cart and provides this information to all other shopping 
// family members.
exports.shoppedItem = (req, res) => {
  shopping_date = req.body.shopping_date;
  store_id = parseInt(req.body.store_id);
  family_id = parseInt(req.body.family_id);
  inventory_id = parseInt(req.body.inventory_id);

  //Create the unique key for this shopping event.
  let key = new ShoppingKey(shopping_date, store_id, family_id);

  // If the key already exists then just add the new item to the 'cart'
  if (shoppingInventory.has(key.key())) {
    shoppingInventory = shoppingInventory.set(key.key(), shoppingInventory.get(key.key()).add(inventory_id));
  } else {
    // This is the firt element that will be in the cart,
    // initialize the 'cart' and put the inventory item inside.
    let inventoryList = new Set();
    inventoryList = inventoryList.add(inventory_id);
    shoppingInventory = shoppingInventory.set(key.key(), inventoryList);
  }

  // Update the shopping the shopping list with shopping_status to '2',
  // the challenge was that this applies to all family members and
  // the sub-query had to added manually.   
  shopping_list.update({
    shopping_status_id: 2
  }, {
    where: {
      inventory_id: inventory_id,
      shopping_date: shopping_date,
      family_member_id: {
        [Op.in]: Sequelize.literal(`(select family_member_id from family_member where family_id=${family_id})`)
      }
    }
  }).then(sl => {
    if (sl) {
      res.status(200).send();
    } else {
      res.status(500).send({
        message: "error while updating shopping list status."
      });
    }
  })
}

// Move the inventory from the cart back to the shelf by changing the shopping status
// to 1 and also update the shopped inventory map (shoppingInventory). This map is
// used to keep all other family members up-to-date.  
exports.unShoppedItem = (req, res) => {
  shopping_date = req.body.shopping_date;
  store_id = parseInt(req.body.store_id);
  family_id = parseInt(req.body.family_id);
  inventory_id = parseInt(req.body.inventory_id);

  let key = new ShoppingKey(shopping_date, store_id, family_id);
  if (shoppingInventory.has(key.key())) {
    shoppingInventory = shoppingInventory.set(key.key(), shoppingInventory.get(key.key()).delete(inventory_id));
  }
  shopping_list.update({
    shopping_status_id: 1
  }, {
    where: {
      inventory_id: inventory_id,
      shopping_date: shopping_date,
      family_member_id: {
        [Op.in]: Sequelize.literal(`(select family_member_id from family_member where family_id=${family_id})`)
      }
    }
  }).then(sl => {
    if (sl) {
      res.status(200).send();
    } else {
      res.status(500).send({
        message: "error while updating shopping list status."
      });
    }
  })
}

// While a family is in the store shopping, the lists
// they are looking at wihle be updated with any changes
// in the shopping status. Also, added items to the
// inventory will be updated.
exports.getShoppedItemStatus = (req, res) => {

  shopping_date = req.query.shopping_date;
  store_id = parseInt(req.query.store_id);
  family_id = parseInt(req.query.family_id);

  let key = new ShoppingKey(shopping_date, store_id, family_id);

  if (!key.valid()) {
    res.send("");
    return;
  }

  let response = "";
  if (shoppingInventory.has(key.key())) {
    response = `{ "key": ${key.key()}, "inventory_id": [${shoppingInventory.get(key.key()).toArray()}]}`;
    res.send(response);
  } else {
    // The shopping Inevntory has to be rebuild because the
    // key was not found.
    shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['inventory_id', 'shopping_status_id'],
      include: [{
        association: 'shopping_list_to_family_member', attributes: ['family_id'],
        where: { family_id: req.query.family_id },
      },
      {
        association: 'shopping_list_to_inventory',
        attributes: [],
        include: [{ association: 'inventory_to_store', attributes: ['store_id'] }],
        exclude: ['picture'],
        where: {
          store_id: req.query.store_id,
        }
      }],
      where: {
        shopping_date: req.query.shopping_date
      },
      order: [
        ['shopping_list_to_inventory', 'name', 'ASC']
      ]
    }).then(data => {
      let inventoryList = new Set();
      shoppingInventory = shoppingInventory.set(key.key(), inventoryList);

      data.forEach(v => {
        if (v['shopping_status_id'] >= 2 && v['shopping_status_id'] <= 3) {
          shoppingInventory = shoppingInventory.set(key.key(), shoppingInventory.get(key.key()).add(v['inventory_id']));
        }
      })
      response = `{ "key": ${key.key()}, "inventory_id": [${shoppingInventory.get(key.key()).toArray()}]}`;
      res.send(response);
    })
  }
}

//--- end of file ---