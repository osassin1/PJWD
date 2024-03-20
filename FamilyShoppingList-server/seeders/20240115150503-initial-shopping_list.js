'use strict';

const { inventory, family_member, shopping_status } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const shopping_status_open = await shopping_status.findOne({
      attributes: ['shopping_status_id'],
      where: {
        shopping_status: "open"
      }
    });

    console.log('shopping_status_open.shopping_status_id', shopping_status_open.shopping_status_id)

    const family_member_osassin = await family_member.findOne({
      attributes: ['family_member_id'],
      where :
      {
        username: 'oliver.sassin'
      }
    });

    const family_member_lea_sassin = await family_member.findOne({
      attributes: ['family_member_id'],
      where :
      {
        username: 'lea.sassin'
      }
    });

    const family_member_heidi_sassin = await family_member.findOne({
      attributes: ['family_member_id'],
      where :
      {
        username: 'heidi.sassin'
      }
    });

    const family_member_john_smith = await family_member.findOne({
      attributes: ['family_member_id'],
      where :
      {
        username: 'john.smith'
      }
    });

    const inventory_from_wholefoods = await inventory.findAll({
      attributes: ['inventory_id', 'store_id', 'quantity_id' ],
      include: [{
        association : 'inventory_to_store'
      }],
      where:{
        '$inventory_to_store.name$': 'Whole Foods'
      }
    });

    console.log('inventory_from_wholefoods:' + inventory_from_wholefoods);


    const inventory_from_costco = await inventory.findAll({
      attributes: ['inventory_id', 'store_id', 'quantity_id' ],
      include: [{
        association : 'inventory_to_store'
      }],
      where:{
        '$inventory_to_store.name$': 'Costco'
      }
    });



    const shopping_date = new Date(new Date().setDate(new Date().getDate() + 7)).toLocaleDateString('en-US',{month: '2-digit', day: '2-digit', year: 'numeric'});   // add seven days to TODAY

    await queryInterface.bulkInsert('shopping_list', [{
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[0].inventory_id,
      quantity: 5,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 2,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: parseInt(shopping_status_open.shopping_status_id),
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 2,
      family_member_id: family_member_john_smith.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()

    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 1,
      family_member_id: family_member_lea_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[2].inventory_id,
      quantity: 3,
      family_member_id: family_member_lea_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[3].inventory_id,
      quantity: 3.5,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[3].inventory_id,
      quantity: 7.5,
      family_member_id: family_member_john_smith.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_costco[0].inventory_id,
      quantity: 12,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[6].inventory_id,
      quantity: 4,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[5].inventory_id,
      quantity: 1,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[4].inventory_id,
      quantity: 7,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[13].inventory_id,
      quantity: 1,
      family_member_id: family_member_heidi_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[12].inventory_id,
      quantity: 1,
      family_member_id: family_member_heidi_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[11].inventory_id,
      quantity: 1,
      family_member_id: family_member_heidi_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[10].inventory_id,
      quantity: 2,
      family_member_id: family_member_heidi_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[10].inventory_id,
      quantity: 1,
      family_member_id: family_member_lea_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[9].inventory_id,
      quantity: 3,
      family_member_id: family_member_heidi_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[9].inventory_id,
      quantity: 2,
      family_member_id: family_member_lea_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[9].inventory_id,
      quantity: 1.5,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[8].inventory_id,
      quantity: 1,
      family_member_id: family_member_heidi_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date,
      inventory_id: inventory_from_wholefoods[6].inventory_id,
      quantity: 2,
      family_member_id: family_member_heidi_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }],{});

    const shopping_date_14days = new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString('en-US',{month: '2-digit', day: '2-digit', year: 'numeric'});   // add seven days to TODAY

    await queryInterface.bulkInsert('shopping_list', [{
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[0].inventory_id,
      quantity: 1,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 2,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 3,
      family_member_id: family_member_lea_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[2].inventory_id,
      quantity: 4,
      family_member_id: family_member_lea_sassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_wholefoods[3].inventory_id,
      quantity: 5,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_14days,
      inventory_id: inventory_from_costco[0].inventory_id,
      quantity: 6,
      family_member_id: family_member_osassin.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }],{});

    const shopping_date_21days = new Date(new Date().setDate(new Date().getDate() + 21)).toLocaleDateString('en-US',{month: '2-digit', day: '2-digit', year: 'numeric'});   // add seven days to TODAY

    await queryInterface.bulkInsert('shopping_list', [{
      shopping_date: shopping_date_21days,
      inventory_id: inventory_from_wholefoods[0].inventory_id,
      quantity: 1,
      family_member_id: family_member_john_smith.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_21days,
      inventory_id: inventory_from_wholefoods[1].inventory_id,
      quantity: 2,
      family_member_id: family_member_john_smith.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_21days,
      inventory_id: inventory_from_wholefoods[2].inventory_id,
      quantity: 4,
      family_member_id: family_member_john_smith.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_21days,
      inventory_id: inventory_from_wholefoods[3].inventory_id,
      quantity: 5,
      family_member_id: family_member_john_smith.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      shopping_date: shopping_date_21days,
      inventory_id: inventory_from_costco[0].inventory_id,
      quantity: 6,
      family_member_id: family_member_john_smith.family_member_id,
      shopping_status_id: shopping_status_open.shopping_status_id,
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
