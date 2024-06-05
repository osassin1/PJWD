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
    
    static associate(models) { 
    }
  }

  shopping_list.init({
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
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      refrences : {
        model: 'inventory',
        key: 'inventory_id',
        as: 'shopping_list_to_inventory'
      }
    },
    shopping_status_id : {
      type: DataTypes.INTEGER,
      foreignKey: true,
      allowNull: false,
      refrences : {
        model: 'shopping_status',
        key: 'shopping_status_id',
        as: 'shopping_list_to_shopping_status'
      }
    },
    quantity: DataTypes.DECIMAL(5,2),
  }, {
    sequelize,
    modelName: 'shopping_list',
  });
  return shopping_list;
};