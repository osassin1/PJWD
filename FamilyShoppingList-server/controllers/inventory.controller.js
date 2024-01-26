const db = require("../models");
const inventory = db.inventory;
//const color = db.color;

const Op = db.Sequelize.Op;


exports.getAllInventory = (req, res) => {

    inventory.findAll({
        attributes: ['shopping_date' ], 
        group: ['shopping_date']
       }
    )
    .then(data => {
        console.log(data);
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving family_member."
      });
    });
};



{/* <img style="display:block; width:10em;height:10em;"' +
                        ' src="' + data['picture'] + '"> 
 */}

exports.getPicture = (req,res) => {
  console.log('getInventoryPicture');
  console.log( req.query );

  inventory.scope('excludeCreatedAtUpdateAt').findByPk(req.query.inventory_id)
  .then(data => {
    if( data ) {
        //console.log( JSON.stringify(data['picture']) );
        //res.status(200).send('<img src="' + data['picture'] + '">');
        //console.log(data['picture']);
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


