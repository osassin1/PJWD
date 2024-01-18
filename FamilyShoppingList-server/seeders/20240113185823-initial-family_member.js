'use strict';

const { color, family_member } = require('../models');
//const { family_member } = require('../models');

//module.db.color = require("./color")(sequelize, Sequelize);

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

    const colorOne = await color.findOne({
      where: {
        name: 'orange'
      }
    });

    await family_member.build({
      username: 'osassin',
      password : 'mysecret',
      first_name: 'Oliver',
      last_name: 'Sassin',
      color_id: parseInt(colorOne.color_id),
      created_at: new Date(),
      updated_at : new Date()
    }).save().then(function(new_family_member){
        colorOne.family_member_id = new_family_member.family_member_id;
    }).catch(function(error){
      console.log(error);
    });

    const updatedInfo = await color.update(
      {
        family_member_id: colorOne.family_member_id 
      },
      {
        where: {
          color_id: parseInt(colorOne.color_id) 
        }
      }
    ).catch(function(error){
      console.log('Update error:' + error);
    });


    const colorOne2 = await color.findOne({
      where: {
        name: 'purple'
      }
    });

    await family_member.build({
      username: 'lea.sassin',
      password : 'mysecret',
      first_name: 'Lea',
      last_name: 'Sassin',
      color_id: parseInt(colorOne2.color_id),
      created_at: new Date(),
      updated_at : new Date()
    }).save().then(function(new_family_member){
        colorOne2.family_member_id = new_family_member.family_member_id;
    }).catch(function(error){
      console.log(error);
    });

    const updatedInfo2 = await color.update(
      {
        family_member_id: colorOne2.family_member_id 
      },
      {
        where: {
          color_id: parseInt(colorOne2.color_id) 
        }
      }
    ).catch(function(error){
      console.log('Update error:' + error);
    });

  // async down (queryInterface, Sequelize) {
  //   /**
  //    * Add commands to revert seed here.
  //    *
  //    * Example:
  //    * await queryInterface.bulkDelete('People', null, {});
  //    */

  //   await queryInterface.bulkDelete('family_member', null, {});

  }
};
