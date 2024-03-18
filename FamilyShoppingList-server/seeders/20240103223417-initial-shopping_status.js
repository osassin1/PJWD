'use strict';

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

    await queryInterface.bulkInsert('shopping_status', [{
      shopping_status: 'open',
      created_at: new Date(),
      updated_at : new Date()
    }, {      
      shopping_status: 'incart',
      created_at: new Date(),
      updated_at : new Date()
    }, {      
      shopping_status: 'purchased',
      created_at: new Date(),
      updated_at : new Date()
    }, {      
      shopping_status: 'closed',
      created_at: new Date(),
      updated_at : new Date()
    }], {});
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
