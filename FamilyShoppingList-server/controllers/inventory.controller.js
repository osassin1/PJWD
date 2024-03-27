const db = require("../models");
const { Map, List } = require('immutable');
const logging = require("../controllers/logging.controller.js");

const inventory = db.inventory;
const shopping_list = db.shopping_list;
const store = db.store;
const list_category = db.list_category;

//const color = db.color;

const Op = db.Sequelize.Op;

class InventoryKeyByCategory {
  constructor(store_id, category_id){
    this.store_id = parseInt(store_id);
    this.category_id = parseInt(category_id);
  }

  key(){
    return JSON.stringify(this);
  }

  // valid(){
  //   if(this.shopping_date=="undefined" ||
  //     this.store_id==null ||
  //     this.family_id==null){
  //       return false;
  //     }
  //     return true;
  // }

}



let listInventoryByCategory = new Map();



exports.createInventoryItem = (req, res) => {
  logging.logEntryLocal('createInventoryItem', req );

  inventory.create({
    name : req.body.name,
    picture : req.body.picture,
    store_id : req.body.store_id,
    list_category_id : req.body.list_category_id,
    quantity_id : req.body.quantity_id,
    shopping_status_id: 1,
    created_at: new Date(),
    updated_at : new Date()    
  }).then( createResult => {
    res.send( String(createResult['inventory_id']) );
    logging.logEntryLocal('createInventoryItem --> createResult', res );
    logging.logEntryLocal("createResult['inventory_id']", createResult['inventory_id']);

    console.log('createInventoryItem --> createResult', createResult);
  }).catch(error => {
    console.log('error',error);
    res.status(500).send({
      message: error.message || "error while creating new inventory item."      
    })
  })
}



exports.createInventoryItemAddToShoppingList = (req, res) => {
  logging.logEntryLocal('createInventoryItemAddToShoppingList', req );

  var inventory_id = 0;

  inventory.create({
    name : req.body.name,
    picture : req.body.picture,
    store_id : req.body.store_id,
    list_category_id : req.body.list_category_id,
    quantity_id : req.body.quantity_id,
    created_at: new Date(),
    updated_at : new Date()    
  }).then( createResult => {
    //logging.logEntryLocal('createInventoryItem --> createResult', res );
    //logging.logEntryLocal("createResult['inventory_id']", createResult['inventory_id']);
    //console.log('createInventoryItem --> createResult', createResult);

    inventory_id = createResult['inventory_id'];

    shopping_list.build({
      shopping_date: req.body.shopping_date,
      family_member_id: req.body.family_member_id,
      inventory_id : inventory_id,
      quantity: req.body.quantity,
      shopping_status_id: 1,
      created_at: new Date(),
      updated_at : new Date()
    }).save().then(insertResult =>{
      console.log('shopping_list.build --> insertResult', insertResult);
      res.send(insertResult);
    }).catch(error_insert => {
      console.log('error_insert',error_insert);
      res.status(500).send({
        message: error_insert.message || "error while inserting during updating shopping list."      
      })
    })



  }).catch(error => {
    console.log('error',error);
    res.status(500).send({
      message: error.message || "error while creating new inventory item."      
    })
  })
}


exports.getInventoryByStore = (req, res) => {
  inventory.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['inventory_id', 'name', 'notes' ], 
      include: { association: 'inventory_to_quantity', attribues: ['name', 'unit', 'symbol'], exclude : ['createdAt','updatedAt'] },
      exclude: ['createdAt','updatedAt'],
      where: {
        store_id: req.query.store_id
      }
     }
  )
  .then(data => {
   var inventoryDataByStore = new List();
   data.forEach(x => {
    
    inventoryDataByStore = inventoryDataByStore.push(
      {
        'inventory_id' : x['inventory_id'],
        'inventory_name' : x['name'],
        'inventory_notes' : x['notes'],
        'inventory_symbol' : x['inventory_to_quantity']['symbol'],
        'quantity_id': x['inventory_to_quantity']['quantity_id'],
        'quantity_unit' : x['inventory_to_quantity']['unit'],
        'quantity_name' : x['inventory_to_quantity']['name'],
        'quantity_symbol' : x['inventory_to_quantity']['symbol'],
      });
    })

    console.log('inventoryDataByStore.toArray():',inventoryDataByStore.toArray());
    res.send(inventoryDataByStore.toArray());
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving inventory by store."
    });
  });
};



exports.getInventoryByCategory = (req, res) => {

  // let keyIventoryByCategory = new InventoryKeyByCategory(req.query.store_id, req.query.list_category_id);

  // if (listInventoryByCategory.has(keyIventoryByCategory.key())) {
  //   listInventoryByCategory = listInventoryByCategory.set(key.key(), shoppingInventory.get(key.key()).add(inventory_id));
  // } else {
  //   let inventoryList = new Set();
  //   inventoryList = inventoryList.add(inventory_id);
  //   shoppingInventory = shoppingInventory.set(key.key(), inventoryList);
  // }


  inventory.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['inventory_id', 'name', 'notes' ], 
      include: { association: 'inventory_to_quantity', attribues: ['name', 'unit', 'symbol'], exclude : ['createdAt','updatedAt'] },
      exclude: ['createdAt','updatedAt'],
      where: {
        list_category_id: req.query.list_category_id,
        store_id: req.query.store_id
      }
     }
  )
  .then(data => {
   //console.log(data);

   //var newInventoryData = Map();
   var inventoryDataByCategory = new List();

  //  var colorForCategory = new List();
  //  var categoryName = "";
  //  var categoryTotalNumOfItems = 0;

   data.forEach(x => {

    //  colorForCategory = colorForCategory.push(x['shopping_list_to_family_member']['family_member_to_color']['name']);
    //  if( categoryName.length == 0){
    //    categoryName = x['shopping_list_to_inventory']['inventory_to_list_category']['name'];
    //  }
    //  categoryTotalNumOfItems++;

    
    inventoryDataByCategory = inventoryDataByCategory.push(
      {
        'inventory_id' : x['inventory_id'],
        'inventory_name' : x['name'],
        'inventory_notes' : x['notes'],
        'inventory_symbol' : x['inventory_to_quantity']['symbol'],
        'quantity_id': x['inventory_to_quantity']['quantity_id'],
        'quantity_unit' : x['inventory_to_quantity']['unit'],
        'quantity_name' : x['inventory_to_quantity']['name'],
        'quantity_symbol' : x['inventory_to_quantity']['symbol'],
      });
    })

    //console.log('inventoryDataByCategory.toArray():',inventoryDataByCategory.toArray());
    res.send(inventoryDataByCategory.toArray());
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving inventory by category."
    });
  });
};



{/* <img style="display:block; width:10em;height:10em;"' +
                        ' src="' + data['picture'] + '"> 
 */}

exports.getPicture = (req,res) => {
  inventory.scope('excludeCreatedAtUpdateAt').findByPk(req.query.inventory_id)
  .then(data => {
    if( data ) {
        res.send(data['picture']);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving inventory picture."
    });
  });;
}

//inventory.getListOfStores

exports.getListOfStores = (req,res) => {
  store.scope('excludeCreatedAtUpdateAt').findAll()
  .then(data => {
    if( data ) {
        res.send(data);
    }
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving list of stores."
    });
  });;
}


exports.getListCategory = (req, res) => {
  list_category.scope('excludeCreatedAtUpdateAt').findAll({
    attributes: ['list_category_id', 'name'],
    order: [['list_category_id', 'ASC']]
  }).then(data => {
    res.send(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving list categories."
      });
    });;
}


