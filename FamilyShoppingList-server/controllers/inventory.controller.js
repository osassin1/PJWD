const db = require("../models");
const { List } = require('immutable');

const inventory = db.inventory;
const shopping_list = db.shopping_list;
const store = db.store;
const list_category = db.list_category;
const quantity = db.quantity;

const Op = db.Sequelize.Op;

// The client app will check if an inventory item
// has any active (shoppig_status<3) refrences and if
// not, it can be deleted.
exports.checkInventoryForDeletion = (req, res) => {
  shopping_list.findAll({     
  exclude: ['createdAt','updatedAt'],
  where: {
    inventory_id: req.query.inventory_id,
    shopping_status_id:  {
      // on get active shopping lists status_id 3 and 4 means, they are done
      // if nothing comes back then it can be marke for deletion, which
      // means changing the status to 'D' in the inventory table
      [Op.lt]: 3    
    }
  }
 }).then(data => {
    res.send(`{"NumberOfReferences": ${data.length} }`);
  }).catch(error => {
    console.error(error);
    res.status(500).send({
      message: error.message || "error while creating new inventory item."      
    })
  })
}

// An inventory can only be deleted if it's not part of
// active shopping list (shoppin_stats < 3). Otherwise
// it would just disappear from someone's list. So, that's
// need be checked first with providing a count.
exports.deleteInventoryItem = (req, res) => {
  shopping_list.count({
  where: {
    inventory_id: req.body.inventory_id,
    shopping_status_id:  {
      // on get active shopping lists status_id 3 and 4 means, they are done
      // if nothing comes back then it can be marke for deletion, which
      // means changing the status to 'D' in the inventory table
      [Op.lt]: 3
    }
  }
 }).then(data => {
    // If there are any references to this inventory item
    // then it cannot be deleted and the family member will
    // be informed through a messge in the client.
    if( data.length > 0 ) {
      res.status(500).send(`{"NumberOfReferences": ${data.length} }`);
      return;
    }

    // The deletion of an inventory item is performed through
    // changing its status to 'D' for deleted. It will remain
    // in the data set.
    inventory.update({
      status: 'D'
    },{
      where: {
        inventory_id: req.body.inventory_id
      }
    }).then(result =>{
      res.status(200).send(`{"updated": ${result} }`)
    }).catch(error => {
      res.status(500).send({
        message: error.message || "error while deleting new inventory item during update"      
      })
    })
  }).catch(error => {
    res.status(500).send({
      message: error.message || "error while deleting new inventory item"      
    })
  })
}

// Update an inventory item.
exports.updateInventoryItem = (req, res) => {
  inventory.update({
    name : req.body.name,
    notes : req.body.notes,
    picture : req.body.picture,
    store_id : req.body.store_id,
    list_category_id : req.body.list_category_id,
    quantity_id : req.body.quantity_id
    }, {
      where: {
        inventory_id: req.body.inventory_id
      }
    }).then( result => {
      res.status(200).send(`{"updated": ${result} }`)
  }).catch(error => {
    res.status(500).send({
      message: error.message || "error while updating inventory item."      
    })
  })
}

// Create a new inventory item and return the new
// inventory_id.
exports.createInventoryItem = (req, res) => {
  inventory.create({
    name : req.body.name,
    notes : req.body.notes,
    picture : req.body.picture,
    store_id : req.body.store_id,
    list_category_id : req.body.list_category_id,
    quantity_id : req.body.quantity_id,
    shopping_status_id: 1,
    created_at: new Date(),
    updated_at : new Date()    
  }).then( createResult => {
    res.send( String(createResult['inventory_id']) );
  }).catch(error => {
    res.status(500).send({
      message: error.message || "error while check inventory item for deletion."      
    })
  })
}

// Get all inventory items for a store, so it can be
// modified. This request also includes the 'pictures'
// of the inventory items.
exports.getInventoryByStoreForEdit = (req, res) => {
  inventory.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['inventory_id', 'picture', 'name', 'notes' ], 
      include: [
      { association: 'inventory_to_quantity',attribues: ['name', 'unit', 'symbol'], exclude : ['createdAt','updatedAt'] },
      { association: 'inventory_to_list_category',attribues: ['name', ], exclude : ['createdAt','updatedAt'] },
      ],
      exclude: ['createdAt','updatedAt'],
      where: {
        store_id: req.query.store_id,
        status: 'A'
      }
  }).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving inventory by store for edit."
    });
  });
};

  // When using the category filter within the inventory page,
  // just return the list for that category. This seemed to be
  // easier than dealing with filtering on the client side.
exports.getInventoryByStoreForEditByCategory = (req, res) => {
  inventory.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['inventory_id', 'picture', 'name', 'notes' ], 
      include: [
      { association: 'inventory_to_quantity',attribues: ['name', 'unit', 'symbol'], exclude : ['createdAt','updatedAt'] },
      { association: 'inventory_to_list_category',attribues: ['name', ], exclude : ['createdAt','updatedAt'] },
      ],
      exclude: ['createdAt','updatedAt'],
      where: {
        list_category_id: req.query.list_category_id,
        store_id: req.query.store_id,
        status: 'A'
      }
     }
  ).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving inventory by store by category for edit."
    });
  });
};

// This returns the items availabe within a certain category
// for a particular store. The pictures for items are handeled
// seperately; the default is the "no_picture.jpg" name that
// the client uses to display in case there's no picture.
// This method also simplifies the sequelize structure and 
// removes the associations.
exports.getInventoryByCategory = (req, res) => {
  inventory.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['inventory_id', 'name', 'notes' ], 
      include: { association: 'inventory_to_quantity', attribues: ['name', 'unit', 'symbol'], exclude : ['createdAt','updatedAt'] },
      exclude: ['createdAt','updatedAt'],
      where: {
        list_category_id: req.query.list_category_id,
        store_id: req.query.store_id,
        status: 'A'
      }
     }
  ).then(data => {
   var list_category_id = parseInt(req.query.list_category_id);
   var inventoryDataByCategory = new List();
   data.forEach(x => {
    inventoryDataByCategory = inventoryDataByCategory.push(
      {
        'inventory_id' : x['inventory_id'],
        'picture' : "no_picture.jpg",
        'name' : x['name'],
        'notes' : x['notes'],
        'symbol' : x['inventory_to_quantity']['symbol'],
        'unit' : x['inventory_to_quantity']['unit'],
        'family_members': null,
        'inventory_to_quantity' : {
            'quantity_id': x['inventory_to_quantity']['quantity_id'],
            'name' : x['inventory_to_quantity']['name'],
            'symbol' : x['inventory_to_quantity']['symbol'],
            'unit' : x['inventory_to_quantity']['unit'],
        },
        'inventory_to_list_category' : {
          'list_category_id' : list_category_id,
          'name' : null,
          'description': null,
        }
      });
    })
    res.send(inventoryDataByCategory.toArray());
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving inventory by category."
    });
  });
};

// Get the picture for an inventory item. 
exports.getPicture = (req,res) => {
  inventory.scope('excludeCreatedAtUpdateAt').findByPk(req.query.inventory_id)
  .then(data => {
    if( data ) {
        res.send(data['picture']);
    }
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving inventory picture."
    });
  });
}

// Get all available stores.
exports.getListOfStores = (req,res) => {
  store.scope('excludeCreatedAtUpdateAt').findAll()
  .then(data => {
    if( data ) {
        res.send(data);
    }
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving list of stores."
    })
  })
}

// Get all defined quantities (like pounds/Lbs).
exports.getQuantities = (req,res) => {
  quantity.scope('excludeCreatedAtUpdateAt').findAll()
  .then(data => {
     res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving quantities."
    })
  })
}

// Get all defined inventory categories,e.g., fruit, meat.
exports.getListCategory = (req, res) => {
  list_category.scope('excludeCreatedAtUpdateAt').findAll({
    attributes: ['list_category_id', 'name'],
    order: [['list_category_id', 'ASC']]
  }).then(data => {
    res.send(data);
  }).catch(err => {
    res.status(500).send({
      message:
        err.message || "error while retrieving list categories."
    });
  });
}

//--- end of file ---