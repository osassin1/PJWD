'use strict';
const {
  Model,
  DataTypes,
  Deferrable
} = require('sequelize');


const { Sequelize } = require('.');
const { Store } = require('./store');

module.exports = (sequelize, DataTypes) => {
  class Inventory extends Model {
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
  Inventory.init({
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

    inventory_store_id : {
      type: DataTypes.INTEGER,
      foreignKey: true,
      refrences : {
        model: 'store',
        key: 'store_id',
        //deferrable: Deferrable.INITIALLY_DEFERRED
      }
    },

    inventory_list_category_id :
    {
      type: DataTypes.INTEGER,
      foreignKey: true,
      refrences : {
        model: 'list_category',
        key: 'list_category_id',
        //deferrable: Deferrable.INITIALLY_DEFERRED
      }
    }


  }, {
    sequelize,
    modelName: 'inventory',
  });
  return Inventory;
};