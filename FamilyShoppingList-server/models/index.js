'use strict';


const { QueryTypes } = require("sequelize");
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

console.log('config.use_env_variable:' + JSON.stringify(config));

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // this is being executed
  sequelize = new Sequelize(
    config.database, 
    config.username, 
    config.password, 
    {
      host: config.host,
      dialect: config.dialect,
      define : {
        freezeTableName: true,
        underscored: true,
        scopes: {                         // the scope defines special rules for selects
          excludeCreatedAtUpdateAt: {
            attributes: { 
              exclude: ['createdAt', 'updatedAt', 'created_at', 'updated_at'] 
            }
          }
        }
      },
      timestamps: false
    }
  );
}

    // "define" : { "freezeTableName": true,
    //              "underscored": true,
    //              "scopes": {
    //               "excludeCreatedAtUpdateAt" : "attributes: { exclude: ['createdAt', 'updatedAt', 'created_at', 'updated_at'] }"
    //              }
    //            }
    // "define" : { "freezeTableName": true,
    //              "underscored": true
    //            }


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    console.log(file);
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.quantity = require("./quantity")(sequelize, Sequelize);

db.inventory = require("./inventory")(sequelize, Sequelize);
db.store = require("./store")(sequelize, Sequelize);
db.list_category = require("./list_category")(sequelize, Sequelize);
db.color = require("./color")(sequelize, Sequelize);
db.shopping_list = require("./shopping_list")(sequelize, Sequelize);

// db.inventory.hasOne(db.listcategory,{
//     through: "inventory_list_category_id",
//     as: "list_category",  // database table name
//     foreignKey: "id",
// });

// db.listcategory.hasMany(db.inventory,{
// //    through: "inventory_list_category_id",
// //    as: "inventory",  // database table name
// //    foreignKey: "id",
// });


// without these associations, it doesn't work
//need to be done here

db.inventory.belongsTo(db.list_category,{
    through: "list_category_id",
    as: "inventory_to_list_category",  // !!!! name of the association !!!!
    foreignKey: "list_category_id",
});

db.inventory.belongsTo(db.store,{
  through: "store_id",
  as: "inventory_to_store",  // !!!! name of the association !!!!
  foreignKey: "store_id",
});

db.inventory.belongsTo(db.quantity,{
  through: "quantity_id",
  as: "inventory_to_quantity",  // !!!! name of the association !!!!
  foreignKey: "quantity_id",
});


// 1:1 relationship between family_member to color
db.family_member.belongsTo(db.color,{
  through: "color_id",
  as: "family_member_to_color",  // !!!! name of the association !!!!
  foreignKey: "color_id",
});

db.color.belongsTo(db.family_member,{
  through: "family_member_id",
  as: "family_member",  // database table name
  foreignKey: "family_member_id",
});



// C:C relationship

db.shopping_list.belongsTo(db.inventory,{
  through: "inventory_id",
  as: "shopping_list_to_inventory",
  foreignKey: "inventory_id",
});

db.shopping_list.belongsTo(db.family_member,{
  through: "family_member_id",
  as: 'shopping_list_to_family_member',
  foreignKey: "family_member_id",
});

// db.inventory.belongsToMany(db.shopping_list,{
//   through: "shopping",
// });



      module.exports = db;


  
  
