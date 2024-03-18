'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class family_member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  family_member.init({
    family_member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      len: [6,40]
    },
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,

    color_id :
    {
      type: DataTypes.INTEGER,
      foreignKey: true,
      refrences : {
        model: 'color',
        key: 'color_id',
      }
    },

    family_id : {
      type: DataTypes.INTEGER,
      foreignKey: true,
      refrences : {
        model: 'family',
        key: 'family_id',
        as: 'family_member_to_family',
      }
    }

  }, {
    sequelize,
    modelName: 'family_member',
  });
  return family_member;
};