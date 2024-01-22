'use strict';

const { inventory, family_member } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const family_member_osassin = await family_member.findOne({
      attributes: ['family_member_id'],
      where :
      {
        username: 'osassin'
      }
    });

    const family_member_lea_sassin = await family_member.findOne({
      attributes: ['family_member_id'],
      where :
      {
        username: 'lea.sassin'
      }
    });

    const inventory_from_wholefoods = await inventory.findAll({
      attributes: ['inventory_id', 'store_id', 'quantity_id' ],
      include: [{
        association : 'store'
      }],
      where:{
        '$store.name$': 'Whole Foods'
      }
    });


    const inventory_from_costco = await inventory.findAll({
      attributes: ['inventory_id', 'store_id', 'quantity_id' ],
      include: [{
        association : 'store'
      }],
      where:{
        '$store.name$': 'Costco'
      }
    });

    const shopping_date = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('en-US');   // add seven days to TODAY

    await queryInterface.bulkInsert('shopping_list', [{
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[0].inventory_id,
      quantity: 5,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 2,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 1,
      family_member_id: family_member_lea_sassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[2].inventory_id,
      quantity: 3,
      family_member_id: family_member_lea_sassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[3].inventory_id,
      quantity: 3.5,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_costco[0].inventory_id,
      quantity: 12,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }],{});

    const shopping_date_14days = new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString('en-US');   // add seven days to TODAY

    await queryInterface.bulkInsert('shopping_list', [{
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[0].inventory_id,
      quantity: 1,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 2,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 3,
      family_member_id: family_member_lea_sassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[2].inventory_id,
      quantity: 4,
      family_member_id: family_member_lea_sassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[3].inventory_id,
      quantity: 5,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_costco[0].inventory_id,
      quantity: 6,
      family_member_id: family_member_osassin.family_member_id,
      created_at: new Date(),
      updated_at : new Date()
    }],{});



  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
