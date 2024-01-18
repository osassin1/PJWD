'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory', {
      inventory_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        reference:{
          model: 'store',
          key: 'store_id'
        }
      },
      list_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        reference:{
          model: 'list_category',
          key: 'list_category_id'
        }
      },
      quantity_id :
      {
        type: DataTypes.INTEGER,
        foreignKey: true,
        refrences : {
          model: 'quantity',
          key: 'quantity_id',
        }
      },
      name: {
        type: Sequelize.STRING,
        unique: true
      },
      picture: {
        type: Sequelize.BLOB    // max size is 64 KB
      },
      notes: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory');
  }
};