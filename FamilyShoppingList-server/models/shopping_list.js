'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class shopping_list extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // db.shopping_list.belongsTo(db.inventory,{
    //   through: "inventory_shopping_list",
    //   as: "shopping_items",  
    //   foreignKey: "inventory_id",
    // });
    
    // db.inventory.belongsToMany(db.shopping_list,{
    //   through: "inventory_shopping_list",
    //   as: "shopping_list",  
    // });
    
    static associate(models) { 
      // this.belongsTo(models.inventory, {
      //     through: "inventory_shopping_list",
      //     foreignKey: "inventory_id",
      // }),
      // models.inventory.belongsToMany( this, {
      //     through: "inventory_shopping_list",
      // })
    }
  }

  shopping_list.init({
    // shopping_list_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    //   autoIncrement: true,
    //   primaryKey: true,
    // },

    shopping_date: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    family_member_id: { 
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      refrences : {
        model: 'family_member',
        key: 'family_member_id',
        as: 'shopping_list_to_family_member'
      }
    },
    inventory_id : {
      type: DataTypes.INTEGER,
      foreignKey: true,
      primaryKey: true,
      allowNull: false,
      refrences : {
        model: 'inventory',
        key: 'inventory_id',
        as: 'shopping_list_to_inventory'
      },
  
    },
    quantity: DataTypes.DECIMAL(5,2),
  }, {
    sequelize,
    modelName: 'shopping_list',
  });
  return shopping_list;
};