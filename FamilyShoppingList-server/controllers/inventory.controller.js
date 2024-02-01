const db = require("../models");
const { Map, List } = require('immutable');

const inventory = db.inventory;
//const color = db.color;

const Op = db.Sequelize.Op;



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

    console.log('inventoryDataByCategory.toArray():',inventoryDataByCategory.toArray());
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


