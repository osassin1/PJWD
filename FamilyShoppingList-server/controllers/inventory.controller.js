const db = require("../models");
const inventory = db.inventory;
//const color = db.color;

const Op = db.Sequelize.Op;


// exports.getAllInventory = (req, res) => {
//     inventory.findAll({
//         attributes: ['shopping_date' ], 
//         group: ['shopping_date']
//        }
//     )
//     .then(data => {
//       //console.log(data);
//       res.send(data);
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "error while retrieving family_member."
//       });
//     });
// };



exports.getInventoryByCategory = (req, res) => {
  inventory.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['inventory_id', 'name', 'notes' ], 
      include: { association: 'inventory_to_quantity', attribues: ['name', 'unit', 'symbol'] },
      where: {
        list_category_id: req.query.list_category_id,
        store_id: req.query.store_id
      }
     }
  )
  .then(data => {
    console.log(data);
    res.send(data);
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


