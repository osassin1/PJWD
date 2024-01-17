'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class quantity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  quantity.init({
    quantity_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: DataTypes.STRING,
    unit: DataTypes.INTEGER,
    symbol: DataTypes.STRING    
  }, {
    sequelize,
    modelName: 'quantity',
  });
  return quantity;
};