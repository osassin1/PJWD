const { QueryTypes, Sequelize } = require("sequelize");
const db = require("../models");
const { Map, List, Set } = require('immutable');
const logFile = require('fs');

//const color = db.color;

const shopping_list = db.shopping_list;
const inventory = db.inventory;
const store = db.store;
const family_member = db.store;
const quantity = db.store;
const list_category = db.list_category;

const Op = db.Sequelize.Op;
const sequelize = db.sequelize

exports.logShoppingList = (req, res) => {

  var logEntry = "{ \"entry\" : { \"date\" : \"" + 
                 new Date().toISOString() + "\" } ,  " +  req.body.log + " }\n";

  logFile.appendFileSync('shoppinglist.log', logEntry, function(err) {
    if( err ) {
      res.status(500).send({message: err.message || "logShoppingList error"});
    }
    else {
      res.status(200).send();
    }
  })
}


class ShoppingKey {
  constructor(date, store_id, family_id){
    this.shopping_date = date;
    this.store_id = parseInt(store_id);
    this.family_id = parseInt(family_id);
  }

  key(){
    return JSON.stringify(this);
  }

  valid(){
    if(this.shopping_date=="undefined" ||
      this.store_id==null ||
      this.family_id==null){
        return false;
      }
      return true;
  }

}

class ListByCategoryKey{
  constructor(date, store_id, family_id, list_category_id){
    this.shopping_date = date;
    this.store_id = parseInt(store_id);
    this.family_id = parseInt(family_id);
    this.list_category_id = parseInt(list_category_id);
  }

  key(){
    return JSON.stringify(this);
  }
}

let shoppingMap = new Map();
let shoppingInventory = new Map();
let listByCategory = new Map();

exports.changeShoppingStatus = (req, res) => {
  shopping_date = req.body.shopping_date;
  store_id = parseInt(req.body.store_id);
  family_id = parseInt(req.body.family_id); 
  shopping_status = req.body.shopping_status;

  res.status(200).send();

  //console.log('startShopping', shopping_date, store_id, family_id, shopping_status)
  //console.log('startShopping::shoppingMap', [...shoppingMap.entries()])
  let key = new ShoppingKey(shopping_date, store_id, family_id);
  
  // console.log('key', key.key())

  shoppingMap = shoppingMap.set( key.key(), shopping_status);

 // console.log('startShopping::shoppingMap', [...shoppingMap.entries()])
}  



// get the status of the shopping activity,
// 
exports.getShoppingListStatus = (req, res) => {

  // console.log('getShoppingStatus');
  
  shopping_date = req.query.shopping_date;
  store_id = parseInt(req.query.store_id);
  family_id = parseInt(req.query.family_id); 

  let key = new ShoppingKey(shopping_date, store_id, family_id);
  let status = 0;
  if( shoppingMap.has(key.key()) ){
    status = shoppingMap.get(key.key());
  }

  let response = `{ "key": ${key.key()}, "status": ${status}}`
  console.log('getShoppingListStatus response', response);
  res.send(response);
}





exports.shoppedItem = (req, res) => {
  shopping_date = req.body.shopping_date;
  store_id = parseInt(req.body.store_id);
  family_id = parseInt(req.body.family_id);
  inventory_id = parseInt(req.body.inventory_id);

  console.log('shoppedItem', shopping_date, store_id, family_id, inventory_id)
  let key = new ShoppingKey(shopping_date, store_id, family_id);
  if (shoppingInventory.has(key.key())) {
    shoppingInventory = shoppingInventory.set(key.key(), shoppingInventory.get(key.key()).add(inventory_id));
  } else {
    let inventoryList = new Set();
    inventoryList = inventoryList.add(inventory_id);
    shoppingInventory = shoppingInventory.set(key.key(), inventoryList);
  }
  console.log('shoppedItem::shoppingInventory', [...shoppingInventory.entries()], shoppingInventory.get(key.key()).toArray())

    shopping_list.update({
          shopping_status_id: 2
        },{
          where : {
            inventory_id: inventory_id,
            shopping_date: shopping_date,
            family_member_id: {
              [Op.in]:  Sequelize.literal(`(select family_member_id from family_member where family_id=${family_id})`)
            }
          }
        }).then( f1 => {
          console.log('f1',JSON.stringify(f1));
          if( f1 ) {
            res.status(200).send();
          } else {
            res.status(500).send({
              message: "error while updating shopping list status."      
            });
          }
        })
}


exports.unShoppedItem = (req, res) => {
  shopping_date = req.body.shopping_date;
  store_id = parseInt(req.body.store_id);
  family_id = parseInt(req.body.family_id); 
  inventory_id = parseInt(req.body.inventory_id); 

//  console.log('unShoppedItem', shopping_date, store_id, family_id, inventory_id)
  let key = new ShoppingKey(shopping_date, store_id, family_id);
  if(shoppingInventory.has(key.key()) ){
    shoppingInventory = shoppingInventory.set(key.key(), shoppingInventory.get(key.key()).delete(inventory_id) );
  }
//  console.log('shoppedItem::shoppingInventory', [...shoppingInventory.entries()], shoppingInventory.get(key.key()).toArray())
shopping_list.update({
  shopping_status_id: 1
},{
  where : {
    inventory_id: inventory_id,
    shopping_date: shopping_date,
    family_member_id: {
      [Op.in]:  Sequelize.literal(`(select family_member_id from family_member where family_id=${family_id})`)
    }
  }
}).then( f1 => {
  console.log('f1',JSON.stringify(f1));
  if( f1 ) {
    res.status(200).send();
  } else {
    res.status(500).send({
      message: "error while updating shopping list status."      
    });
  }
})
}





exports.getShoppedItemStatus = (req, res) => {

  shopping_date = req.query.shopping_date;
  store_id = parseInt(req.query.store_id);
  family_id = parseInt(req.query.family_id); 


  let key = new ShoppingKey(shopping_date, store_id, family_id);

  if(!key.valid()){
    //console.log('(0) getShoppedItemStatus: invalid key');
    res.send("");
    return;
  }

  let items = shoppingInventory.get(key.key());

  let response =  "";
  if( shoppingInventory.has(key.key()) ) {
    response = `{ "key": ${key.key()}, "inventory_id": [${shoppingInventory.get(key.key()).toArray()}]}`;
    //console.log('(1) getShoppedItemStatus:response',response);
    res.send(response);
  } else {
      // The shopping Inevntory has to be rebuild
      //
      shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
        attributes: ['inventory_id',  'shopping_status_id'],
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
          [ 'shopping_list_to_inventory', 'name', 'ASC'] 
        ]
      }).then(data => {

        let inventoryList = new Set();
        shoppingInventory = shoppingInventory.set(key.key(), inventoryList);            

        data.forEach(v => {
          if( v['shopping_status_id'] >= 2 &&  v['shopping_status_id'] <=3 ){
              shoppingInventory = shoppingInventory.set(key.key(), shoppingInventory.get(key.key()).add(v['inventory_id']));
          }
        })
        response = `{ "key": ${key.key()}, "inventory_id": [${shoppingInventory.get(key.key()).toArray()}]}`;

        //console.log('(2) getShoppedItemStatus:response',response);
        res.send(response);
      })
  }
}



exports.updateShoppingList = (req, res) => {
  // if quantity is 0 then remove the item from
  // the shopping list otherwise update the quantity
  // or insert a new item
  if( req.body.quantity == 0 ){
    shopping_list.destroy({
      where : {
        shopping_date: req.body.shopping_date,
        family_member_id: req.body.family_member_id,
        inventory_id : req.body.inventory_id
      }
    }).then( result => {
      console.log('destroy result',result);
      res.status(200).send();

    }).catch(error_find_one => {
      console.log('error_find_one',error_find_one);
      res.status(500).send({
        message: error_find_one.message || "error while destroying during updating shopping list."      
      }) 
    })

  }
  else {
    shopping_list.update({
        quantity: req.body.quantity
      },{
        where: {
          shopping_date: req.body.shopping_date,
          family_member_id: req.body.family_member_id,
          inventory_id : req.body.inventory_id
        }
      }).then( result =>{
        //console.log('result', result);
        res.send( String(result) );

        // no updates performed, so enter it (create a new record)
        if( result == 0 ){
          shopping_list.build({
            shopping_date: req.body.shopping_date,
            family_member_id: req.body.family_member_id,
            inventory_id : req.body.inventory_id,
            quantity: req.body.quantity,
            created_at: new Date(),
            updated_at : new Date()
          }).save().then(insertResult =>{
            //console.log('shopping_list.build --> insertResult', insertResult);
          }).catch(error_insert => {
            console.log('error_insert',error_insert);
            res.status(500).send({
              message: error_insert.message || "error while inserting during updating shopping list."      
            })
          })
        }
      }).catch(error_update => {
        console.log('error_update',error_update);
        res.status(500).send({
          message: error_update.message || "error while updating shopping list."      
        }) 
      })
  }

};

exports.getShoppingDates = (req, res) => {
  shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
    raw: true,
    attributes: ['shopping_date'],
    include: [{
      association: 'shopping_list_to_family_member', attributes: ['family_id'],
      where: {
        family_id: req.query.family_id
      }
      },{
      association: 'shopping_list_to_inventory', attributes: [], exclude: ['inventory_id', 'store_id'],
      include: { association: 'inventory_to_store', attributes: ['name'], exclude: ['store_id'] }
    }],
    order : [['shopping_date', 'ASC']],
    group: ['shopping_date', 'shopping_list_to_inventory->inventory_to_store.store_id'],
    

  }).then(data => {
    res.send(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving shopping dates."
      });
    });
};


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


exports.getList = (req, res) => {
  shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
    attributes: ['shopping_date', 'family_member_id'],
    include: [{
      association: 'shopping_list_to_family_member', attributes: ['first_name', 'color_id'],
      where: { family_id: req.query.family_id },
      include: { association: 'family_member_to_color', attribute: ['name', 'color_id'] }
    },
    {
      association: 'shopping_list_to_inventory',
      attributes: ['name', 'list_category_id', 'quantity_id'],
      include: [{ association: 'inventory_to_store', attributes: ['store_id'] },
      { association: 'inventory_to_list_category', attributes: ['name'] },
      { association: 'inventory_to_quantity', attribues: ['name', 'unit', 'symbol'] }],
      exclude: ['picture'],
      where: {
        store_id: req.query.store_id
      }
    }],
    order : [['name', 'ASC']],
    where: {
      shopping_date: req.query.shopping_date
    }
  }).then(data => {
    res.send(data);
  })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving shopping_list."
      });
    });
}



exports.getListByCategoryGroupByCached = (req, res) => {
  let listByCategoryKey = new ListByCategoryKey(req.query.shopping_date, req.query.store_id, req.query.family_id, req.query.list_category_id);
  //console.log('getListByCategoryGroupByCached', listByCategory.get(listByCategoryKey.key()))
  res.send(listByCategory.get(listByCategoryKey.key()));
}

exports.getListByCategoryGroupBy = (req, res) => {
  shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
    attributes: ['shopping_date', 'family_member_id', 'quantity', 'inventory_id',  'shopping_status_id', '`shopping_list_to_inventory`.`name`'],
    include: [{
      association: 'shopping_list_to_family_member', attributes: ['first_name', 'last_name', 'color_id'],
      where: { family_id: req.query.family_id },
      include: { association: 'family_member_to_color', attribute: ['name', 'color_id'] }
    },
    {
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
      shopping_date: req.query.shopping_date
    },
    order: [
      [ 'shopping_list_to_inventory', 'name', 'ASC'] 
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
      if( categoryName.length == 0){
        categoryName = x['shopping_list_to_inventory']['inventory_to_list_category']['name'];
      }
      categoryTotalNumOfItems++;



      // Prune the inventory data
      if( !newInventoryData.has(x['inventory_id']) ) {
        newInventoryData = newInventoryData.set( x['inventory_id'], {'num_of_items' : 1,
          'quantity' : x['quantity'],
          'shopping_status_id' : x['shopping_status_id'],
          'inventory_id' : x['inventory_id'],
          'inventory_name' : x['shopping_list_to_inventory']['name'],
          'inventory_notes' : x['shopping_list_to_inventory']['notes'],
          'inventory_symbol' : x['shopping_list_to_inventory']['inventory_to_quantity']['symbol'],
          'inventory_unit' : x['shopping_list_to_inventory']['inventory_to_quantity']['unit'],
          'family_members' : [ {'name' : x['shopping_list_to_family_member']['family_member_to_color']['name'],
                                'quantity' : x['quantity'],
                                'first_name' : x['shopping_list_to_family_member']['first_name'],
                                'last_name' : x['shopping_list_to_family_member']['last_name'],
                                'family_member_id' : x['family_member_id'],
            } ] 
        });
      } 
      else {
          var y = newInventoryData.get(x['inventory_id']); 
          var family_member_array = y['family_members'];
          
          family_member_array.push({'name' : x['shopping_list_to_family_member']['family_member_to_color']['name'],
                                    'quantity'   : x['quantity'],
                                    'first_name' : x['shopping_list_to_family_member']['first_name'],
                                    'last_name'  : x['shopping_list_to_family_member']['last_name'],
                                    'family_member_id' : x['family_member_id'],
                                  
          });

          newInventoryData = newInventoryData.set( x['inventory_id'], {'num_of_items' : y['num_of_items'] + 1,
          'quantity' : parseFloat(y['quantity']) + parseFloat(x['quantity']),
          'shopping_status_id' : x['shopping_status_id'],
          'inventory_id' : x['inventory_id'],
          'inventory_name' : y['inventory_name'],
          'inventory_notes' : y['inventory_notes'],
          'inventory_symbol' : y['inventory_symbol'],
          'inventory_unit' : y['inventory_unit'],
          'family_members' : family_member_array });
      }
      
     });

    var categoryTotal = {
      'category_name' : categoryName,
      'total_num_of_items' : categoryTotalNumOfItems,
      'family_members': colorForCategory.toOrderedSet().toList() // this makes it unique colors
    };
    var returnData = {'category' : categoryTotal,
                      'inventory' : newInventoryData.toOrderedSet().toArray()
    };

    let listByCategoryKey = new ListByCategoryKey(req.query.shopping_date, req.query.store_id, req.query.family_id, req.query.list_category_id);
    listByCategory = listByCategory.set(listByCategoryKey.key(), returnData);

    res.send(returnData);
  })
    .catch(err => {
      //console.error( err );
      res.status(500).send({
        message:
          err.message || "error while retrieving getListByCategoryGroupBy."
      });
    });


}
