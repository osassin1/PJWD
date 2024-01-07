'use strict';

//const loadpicture = require('fs');
const base64Img = require('base64-img');
//var apple_mcintosh = base64Img.base64('Organic-Red-Mcintosh-Apples.jpg');
//var apple_empire = base64Img.base64('Organic-Red-Empire-Apples.jpg');

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
    await queryInterface.bulkInsert('inventory', [{
      name: 'Apple sauce, organic',
      picture: base64Img.base64Sync('images/apple-sauce-small.jpg'),
      notes: 'Small apple sauce containers - just buy them if bigger glasses are not available.',
      inventory_store_id: 1,
      inventory_list_category_id: 7,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Bananas, organic',
      picture: base64Img.base64Sync('images/bananas.jpg'),
      notes: 'Try to get them not too yellow.',
      inventory_store_id: 1,
      inventory_list_category_id: 1,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Black beans, organic',
      picture: base64Img.base64Sync('images/black-beans.jpg'),
      notes: 'We should try to stock up if they are on sale.',
      inventory_store_id: 1,
      inventory_list_category_id: 7,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Butternut squash, organic',
      picture: base64Img.base64Sync('images/butternut-squash.jpg'),
      notes: 'Get the largest available.',
      inventory_store_id: 1,
      inventory_list_category_id: 2,
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Pasta, organic',
      picture: base64Img.base64Sync('images/pasta-organic.jpg'),
      notes: 'They are egg free and they do not use eggs at all.',
      inventory_store_id: 2,
      inventory_list_category_id: 7,
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
