'use strict';

//const loadpicture = require('fs');
const base64Img = require('base64-img');

//var apple_mcintosh = base64Img.base64('Organic-Red-Mcintosh-Apples.jpg');
//var apple_empire = base64Img.base64('Organic-Red-Empire-Apples.jpg');


const { store } = require('../models');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    const storeWholeFoods = await store.findOne({
      where: {
        name: 'Whole Foods'
      }
    });


    await queryInterface.bulkInsert('inventory', [{
      name: 'Apple sauce, organic',
      picture: base64Img.base64Sync('images/apple-sauce-small.jpg'),
      notes: 'Small apple sauce containers - just buy them if bigger glasses are not available.',
      store_id: parseInt(storeWholeFoods.store_id),
      list_category_id: 7,
      quantity_id: 1,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Bananas, organic',
      picture: base64Img.base64Sync('images/bananas.jpg'),
      notes: 'Try to get them not too yellow.',
      store_id: parseInt(storeWholeFoods.store_id),
      list_category_id: 1,
      quantity_id: 3,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Black beans, organic',
      picture: base64Img.base64Sync('images/black-beans.jpg'),
      notes: 'We should try to stock up if they are on sale.',
      store_id: parseInt(storeWholeFoods.store_id),
      list_category_id: 7,
      quantity_id: 3,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Butternut squash, organic',
      picture: base64Img.base64Sync('images/butternut-squash.jpg'),
      notes: 'Get the largest available.',
      store_id: parseInt(storeWholeFoods.store_id),
      list_category_id: 2,
      quantity_id: 1,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Pasta, organic',
      picture: base64Img.base64Sync('images/pasta-organic.jpg'),
      notes: 'They are egg free and they do not use eggs at all.',
      store_id: 2,
      list_category_id: 7,
      quantity_id: 3,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Carrots, organic',
      picture: base64Img.base64Sync('images/carrots-organic.jpg'),
      notes: 'Get longer ones with green on it.',
      store_id: parseInt(storeWholeFoods.store_id),
      list_category_id: 2,
      quantity_id: 3,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Fennel, organic',
      picture: base64Img.base64Sync('images/fennel-organic.jpg'),
      notes: 'Smaller ones are ok.',
      store_id: parseInt(storeWholeFoods.store_id),
      list_category_id: 2,
      quantity_id: 3,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Onion (Yellow), organic',
      picture: base64Img.base64Sync('images/onion-yellow-organic.jpg'),
      notes: '',
      store_id: parseInt(storeWholeFoods.store_id),
      list_category_id: 2,
      quantity_id: 3,
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
