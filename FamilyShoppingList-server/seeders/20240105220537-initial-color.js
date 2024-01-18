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
    await queryInterface.bulkInsert('color', [{
      name: 'red',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'yellow',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name : 'green',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name : 'purple',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name : 'blue',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name : 'orange',
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
