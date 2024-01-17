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
      // define association here
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
      type: DataTypes.DATE,
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
      }
    },
    quantity: DataTypes.DECIMAL(5,2),
  }, {
    sequelize,
    modelName: 'shopping_list',
  });
  return shopping_list;
};