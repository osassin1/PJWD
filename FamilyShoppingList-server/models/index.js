'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);


// When starting the server.js process, the environment
// variable NODE_ENV will be read to determine what database
// configuration should be used. If this is not set then
// the 'development' will be used.
//
// For a pure local environemnt, please use 'test'. In the
// config.json there are there defined environments:
//
// {
//   "development": {
//     "username": "shopping_list",
//     "password": "airY@Shop99",
//     "database": "shopping_list_db",
//     "host": "192.168.1.195",
//     "dialect": "mysql"
//   },
//   "test": {
//     "username": "shopping_list",
//     "password": "airY@Shop99",
//     "database": "shopping_list_db",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//     },
//   "production": {
//     "username": "root",
//     "password": null,
//     "database": "database_production",
//     "host": "127.0.0.1",
//     "dialect": "mysql"
//   }
// }
//
// The production environemnt is not really defined
// but could be used for production.

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

console.log('config.use_env_variable:', config);

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
      logging: false,
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


// Load the data model into sequelize
fs.readdirSync(__dirname).filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  }).forEach(file => {
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
db.shopping_status = require("./shopping_status")(sequelize, Sequelize);
db.family = require("./family")(sequelize, Sequelize);



// An inventroy item belongs to eactly one
// list_category and a list_category can belong
// to 0 or more inventory items (however,
// the physical model will use a 1:N relation
// ship)

db.inventory.belongsTo(db.list_category,{
    through: "list_category_id",
    as: "inventory_to_list_category",  // !!!! name of the association !!!!
    foreignKey: "list_category_id",
});

// An inventory item belongs to exactly one
// store (one could argue that an item could
// be sold in more than one store but here we
// assign it to a specific store for simplicity
// reasons)

db.inventory.belongsTo(db.store,{
  through: "store_id",
  as: "inventory_to_store",  // !!!! name of the association !!!!
  foreignKey: "store_id",
});

// An inventory item belongs to exactly one
// quantity item (e.g. item(s), kg (weight))

db.inventory.belongsTo(db.quantity,{
  through: "quantity_id",
  as: "inventory_to_quantity",  // !!!! name of the association !!!!
  foreignKey: "quantity_id",
});


// A family_member belongs to exactly
// one color as part of a family, which
// cannot be modelled easily. A family_member
// aslo belongs to exactly one family.
// However, a family has 0 or more
// family_members (cannot be realized with
// a physical model)

db.family_member.belongsTo(db.color,{
  through: "color_id",
  as: "family_member_to_color",  // !!!! name of the association !!!!
  foreignKey: "color_id",
});

db.family_member.belongsTo(db.family, {
  through: "family_id",
  as: 'family_member_to_family',
  foreignKey: "family_id",
})

// A shopping list (item) belongs to exactly one 
// family_member. It is important to mention that
// a shopping list consists of items on the list
// and form altogether the actual list. A 
// family_member can contribute to a shopping list
// with 0 or more items.
db.shopping_list.belongsTo(db.family_member,{
  through: "family_member_id",
  as: 'shopping_list_to_family_member',
  foreignKey: "family_member_id",
});

// A shopping list (item) has exactly one
// inventory item
db.shopping_list.belongsTo(db.inventory,{
  through: "inventory_id",
  as: "shopping_list_to_inventory",
  foreignKey: "inventory_id",
});

db.shopping_list.belongsTo(db.shopping_status,{
  through: "shopping_status_id",
  as: "shopping_list_to_shopping_status",
  foreignKey: "shopping_status_id",
});


module.exports = db;
 
//--- end of file ---