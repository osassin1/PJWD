const { QueryTypes } = require("sequelize");
const db = require("../models");
//const family_member = require("../models/family_member");

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
    console.log('getShoppingDates');

    shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
        raw: true,

        attributes: ['shopping_date' ],
        include: [ {association: 'shopping_list_to_inventory', attributes : [], exclude: [ 'inventory_id', 'store_id' ],
                      include: { association : 'inventory_to_store', attributes: ['name'],exclude: ['store_id'] }
                   }],
                   group: [ 'shopping_date', 'shopping_list_to_inventory->inventory_to_store.store_id' ]

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


exports.getListCategory = (req,res) => {
  console.log('getList2');
  console.log( req.query );

  list_category.scope('excludeCreatedAtUpdateAt').findAll({
      attributes: ['list_category_id', 'name'],
      order: [ ['list_category_id', 'ASC'] ]
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
  console.log('getList');
  console.log( req.query );

  shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
      //raw: true,

      attributes : ['shopping_date','family_member_id'],
      include : [ {association: 'shopping_list_to_family_member', attributes : ['first_name', 'color_id'],
                      include: { association : 'family_member_to_color', attribute : ['name', 'color_id']}},
                  { association: 'shopping_list_to_inventory',
                      attributes: [ 'name', 'list_category_id', 'quantity_id'],
                      include: [{association : 'inventory_to_store', attributes : ['store_id'] },
                                {association : 'inventory_to_list_category', attributes : ['name']},
                                {association : 'inventory_to_quantity', attribues : ['name', 'unit', 'symbol']}],      
                      exclude: ['picture'],
                      where : {
                        store_id : req.query.store_id
                      }
      }],
      where : {
        shopping_date : req.query.shopping_date
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


    exports.getListByCategory = (req, res) => {
      console.log('getListByCategory');
      console.log( req.query );
    
      shopping_list.scope('excludeCreatedAtUpdateAt').findAll({
          //raw: true,
    
          attributes : ['shopping_date','family_member_id', 'quantity'],
          include : [ {association: 'shopping_list_to_family_member', attributes : ['first_name', 'last_name','color_id'],
                          include: { association : 'family_member_to_color', attribute : ['name', 'color_id']}},
                      { association: 'shopping_list_to_inventory',
                          attributes: [ 'name', 'list_category_id', 'quantity_id'],
                          include: [{association : 'inventory_to_store', attributes : ['store_id'] },
                                    {association : 'inventory_to_list_category', attributes : ['name']},
                                    {association : 'inventory_to_quantity', attribues : ['name', 'unit', 'symbol']}],      
                          exclude: ['picture'],
                          where : {
                            store_id : req.query.store_id,
                            list_category_id : req.query.list_category_id
                          }
          }],
          where : {
            shopping_date : req.query.shopping_date
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
    
