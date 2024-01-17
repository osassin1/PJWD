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
    await queryInterface.bulkInsert('quantity', [{
      name: 'pounds',
      unit: 1,
      symbol: 'lbs',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'kilograms',
      unit: 1,          // weight
      symbol: 'kg',       
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name : 'number',
      unit: 2,            //number
      symbol: '',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name : 'gallon',  
      unit: 3,            // volume
      symbol: 'gal',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name : 'liter',  
      unit: 3,            // volume
      symbol: 'L',
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
