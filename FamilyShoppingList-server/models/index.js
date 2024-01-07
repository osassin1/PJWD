'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

console.log('config.use_env_variable:' + JSON.stringify(config) + JSON.stringify(process.env[config.use_env_variable]));

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  console.log('database else ...');
  sequelize = new Sequelize(config.database, config.username, config.password, config );
}

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

db.inventory = require("./inventory")(sequelize, Sequelize);
db.store = require("./store")(sequelize, Sequelize);
db.listcategory = require("./listcategory")(sequelize, Sequelize);

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


db.inventory.belongsTo(db.listcategory,{
    through: "inventory_list_category_id",
    as: "list_category",  // database table name
    foreignKey: "inventory_list_category_id",
});


module.exports = db;


