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
    await queryInterface.bulkInsert( 'list_category', [{
      name: 'Fruit',
      description: 'apples, strawberries, bananas, watermelon, etc.',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Vegtable',
      description: 'carrots, potatos, bell peppers, onions, etc.',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Meat',
      description: 'chicken, turkey, beef, sausages, burgers, etc.',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Dairy',
      description: 'milk, cheese, sour cream, creamer, etc.',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Deli',
      description: 'sandwich meat, cheeses, breads, etc.',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Bakery',
      description: 'bread, cake, donuts, cupcakes, etc.',
      created_at: new Date(),
      updated_at : new Date()
    }, {
      name: 'Cans & Pasta',
      description: 'cans, pasta, apple sauce, jelly, etc.',
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
