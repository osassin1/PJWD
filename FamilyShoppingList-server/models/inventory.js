'use strict';
const {
  Model,
  DataTypes,
  Deferrable
} = require('sequelize');


const { Sequelize } = require('.');

module.exports = (sequelize, DataTypes) => {
  class inventory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      //store,
      //list_category
    }
  }
  inventory.init({
    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    picture: {
      type: DataTypes.BLOB,
      allowNull: true,
      // get(){
      //   return this.getDataValue('picture').toString('utf8');
      // }
    }, 
    notes: DataTypes.STRING,

    store_id : {
      type: DataTypes.INTEGER,
      foreignKey: true,
      refrences : {
        model: 'store',
        key: 'store_id',
        as: 'inventory_to_store'
      }
    },

    list_category_id :
    {
      type: DataTypes.INTEGER,
      foreignKey: true,
      refrences : {
        model: 'list_category',
        key: 'list_category_id',
        as: 'inventory_to_list_category'
      }
    },

    quantity_id :
    {
      type: DataTypes.INTEGER,
      foreignKey: true,
      refrences : {
        model: 'quantity',
        key: 'quantity_id',
        as: 'inventory_to_quantity' 
      }
    }

  }, {
    sequelize,
    modelName: 'inventory',
  });
  return inventory;
};