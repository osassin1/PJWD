const { QueryTypes } = require("sequelize");
const db = require("../models");

//const color = db.color;

const shopping_list = db.shopping_list;
const inventory = db.inventory;
const store = db.store;

const Op = db.Sequelize.Op;
const sequelize = db.sequelize

exports.getShoppingDates = (req, res) => {
    console.log('getShoppingDates');

    shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
        raw: true,
        attributes: [ 'shopping_date' ],
        include: { model: inventory,
                   attributes: [ ],
                   exclude: [ 'inventory_id', 'store_id' ],
                   include: { model: store, as: 'store', 
                              attributes : [ 'name' ],
                              exclude: ['store_id'] }
                 }, 
        group: [ 'shopping_date', 'inventory->store.store_id' ]

    }).then(data => {
            console.log(data);
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "error while retrieving shopping_list."
          });
        });
};

exports.getList = (req, res) => {
    console.log('getList');

    shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
        //raw: true,
        //attributes: [ 'shopping_date' ],
        include: { model: inventory,
                   attributes: [ 'name', 'store_id', 'list_category_id'],
                   exclude: [ 'picture', 'notes' ],
                   include: { model: store, as: 'store', 
                              attributes : [ 'name' ],
                              exclude: ['store_id'],
                              where : {
                                store_id : req.body.store_id
                            } },
                    where: {
                        store_id : req.body.store_id
                    }
                 }, 
        //group: [ 'shopping_date', 'inventory->store.store_id' ]
        where : {
            shopping_date : req.body.shopping_date,
        }

    }).then(data => {
            console.log(data);
          res.send(data);
        })
        .catch(err => {
          res.status(500).send({
            message:
              err.message || "error while retrieving shopping_list."
          });
        });
};



// retrieve all family_members from the database.
// exports.getAllShoppinListByFamilyMember = (req, res) => {

//     const title = req.query.title;

//     shopping_list.findAll({
//         attributes: ['family_member_id', 'username', 'first_name', 'last_name', 'color.name' ], 
//         include: { model: color, as: 'color', attributes : ['color_id', 'family_member_id', 'name'] } 
//        }
//     )
//     .then(data => {
//         console.log(data);
//       res.send(data);
//     })
//     .catch(err => {
//       res.status(500).send({
//         message:
//           err.message || "error while retrieving family_member."
//       });
//     });
// };


// family_member.scope('excludeCreatedAtUpdateAt').findOne({
//     attributes: ['family_member_id', 'username', 'password', 'first_name', 'last_name', 'color.name' ], 
//     include: { model: color, as: 'color', attributes : ['color_id', 'family_member_id', 'name'] }, 
//     where: {
//       username: req.body.username
//     }
// })
// .then(family_member => {

//     if( family_member === null ){
//       return res.status(401).send({
//         accessToken: null,
//         message: "unkown username - please try again"
//       });
//     }

//     var checkPassword = bcrypt.compareSync(
//       req.body.password,
//       family_member.password
//     );

//     if (!checkPassword) {
//       return res.status(401).send({
//         accessToken: null,
//         message: "password mismatch - please try again"
//       });
//     } 

//     const token = jwt.sign({ id: family_member.family_member_id },
//       "the secretc of the family shopping list",
//       {
//         algorithm: 'HS256',
//         allowInsecureKeySizes: true,
//         expiresIn: 86400, // 24 hours
//       });

//       console.log('token : ' + token );

//       return res.status(200).send({
//         family_member_id: family_member.family_member_id,
//         username: family_member.username,
//         first_name: family_member.first_name,
//         last_name: family_member.last_name,
//         color : { color_id: family_member.color.color_id,
//                   name: family_member.color.name },
//         token
//       });

//   })
//   .catch(err => {
//     res.status(500).send({
//       message:
//         err.message || "error while login family_member."
//     });
//   });

