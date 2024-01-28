const { QueryTypes } = require("sequelize");
const db = require("../models");
const { Map, List } = require('immutable');

//const color = db.color;

const shopping_list = db.shopping_list;
const inventory = db.inventory;
const store = db.store;
const family_member = db.store;
const quantity = db.store;
const list_category = db.list_category;

const Op = db.Sequelize.Op;
const sequelize = db.sequelize

exports.getShoppingDates = (req, res) => {
  shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
    raw: true,
    attributes: ['shopping_date'],
    include: [{
      association: 'shopping_list_to_inventory', attributes: [], exclude: ['inventory_id', 'store_id'],
      include: { association: 'inventory_to_store', attributes: ['name'], exclude: ['store_id'] }
    }],
    order : [['shopping_date', 'ASC']],
    group: ['shopping_date', 'shopping_list_to_inventory->inventory_to_store.store_id'],
    

  }).then(data => {
    //console.log(data);
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
    //console.log(data);
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
    where: {
      shopping_date: req.query.shopping_date
    }
  }).then(data => {
    //console.log(data);
    res.send(data);
  })
    .catch(err => {
      //console.error( err );
      res.status(500).send({
        message:
          err.message || "error while retrieving shopping_list."
      });
    });
}

exports.getListByCategoryGroupBy = (req, res) => {
  shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
    attributes: ['shopping_date', 'family_member_id', 'quantity', 'inventory_id'],
    include: [{
      association: 'shopping_list_to_family_member', attributes: ['first_name', 'last_name', 'color_id'],
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
      ['inventory_id', 'ASC'] 
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
          'inventory_id' : x['inventory_id'],
          'inventory_name' : x['shopping_list_to_inventory']['name'],
          'inventory_notes' : x['shopping_list_to_inventory']['notes'],
          'inventory_symbol' : x['shopping_list_to_inventory']['inventory_to_quantity']['symbol'],
          'inventory_unit' : x['shopping_list_to_inventory']['inventory_to_quantity']['unit'],
          'family_members' : [ {'name' : x['shopping_list_to_family_member']['family_member_to_color']['name'],
                                'quantity' : x['quantity'],
                                'first_name' : x['shopping_list_to_family_member']['first_name'],
                                'last_name' : x['shopping_list_to_family_member']['last_name']
            } ] 
        });
      } 
      else {
          var y = newInventoryData.get(x['inventory_id']); 
          var family_member_array = y['family_members'];
          
          family_member_array.push({'name' : x['shopping_list_to_family_member']['family_member_to_color']['name'],
                                    'quantity'   : x['quantity'],
                                    'first_name' : x['shopping_list_to_family_member']['first_name'],
                                    'last_name'  : x['shopping_list_to_family_member']['last_name']
                                  
          });

          newInventoryData = newInventoryData.set( x['inventory_id'], {'num_of_items' : y['num_of_items'] + 1,
          'quantity' : parseFloat(y['quantity']) + parseFloat(x['quantity']),
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
      'family_members': colorForCategory.toSet().toList() // this makes it unique colors
    };
    var returnData = {'category' : categoryTotal,
                      'inventory' : newInventoryData.toSet().toArray()
    };

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
