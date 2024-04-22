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
        reference: {
          model: 'store',
          key: 'store_id',
          as: 'inventory_to_store'
        }
      },
      list_category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        foreignKey: true,
        reference: {
          model: 'list_category',
          key: 'list_category_id',
          as: 'inventory_to_list_category'
        }
      },
      quantity_id:
      {
        type: DataTypes.INTEGER,
        foreignKey: true,
        refrences: {
          model: 'quantity',
          key: 'quantity_id',
          as: 'inventory_to_quantity'
        }
      },
      name: {
        type: Sequelize.STRING
      },
      picture: {
        type: Sequelize.BLOB('medium')    
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