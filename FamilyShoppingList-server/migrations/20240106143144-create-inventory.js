'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      inventory_store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        reference:{
          model: 'store',
          key: 'store_id'
        }
      },
      inventory_list_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        reference:{
          model: 'list_category',
          key: 'list_category_id'
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