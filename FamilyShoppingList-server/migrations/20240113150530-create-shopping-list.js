'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('shopping_list', {
      // shopping_list_id: {
      //   allowNull: false,
      //   autoIncrement: true,
      //   primaryKey: true,
      //   type: Sequelize.INTEGER
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
      quantity: DataTypes.DECIMAL,
      family_member_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('shopping_list');
  }
};