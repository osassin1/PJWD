'use strict';

const { color, family_member, family } = require('../models');
//const { family_member } = require('../models');

var bcrypt = require("bcryptjs");


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

    const familyOne = await family.findOne({
      where: {
        family_id: 1
      }
    });

    const colorOne = await color.findOne({
      where: {
        name: 'orange'
      }
    });

    await family_member.build({
      username: 'oliver.sassin',
      password : bcrypt.hashSync('mysecret', 8),
      first_name: 'Oliver',
      last_name: 'Sassin',
      color_id: parseInt(colorOne.color_id),
      family_id: parseInt(familyOne.family_id),
      created_at: new Date(),
      updated_at : new Date()
    }).save().then(function(new_family_member){
        colorOne.family_member_id = new_family_member.family_member_id;
    }).catch(function(error){
      console.log(error);
    });

    const colorOne2 = await color.findOne({
      where: {
        name: 'pink'
      }
    });

    await family_member.build({
      username: 'lea.sassin',
      password : bcrypt.hashSync('mysecret', 8),
      first_name: 'Lea',
      last_name: 'Sassin',
      color_id: parseInt(colorOne2.color_id),
      family_id: parseInt(familyOne.family_id),
      created_at: new Date(),
      updated_at : new Date()
    }).save().then(function(new_family_member){
        colorOne2.family_member_id = new_family_member.family_member_id;
    }).catch(function(error){
      console.log(error);
    });

    const colorOne3 = await color.findOne({
      where: {
        name: 'purple'
      }
    });

    await family_member.build({
      username: 'heidi.sassin',
      password : bcrypt.hashSync('mysecret', 8),
      first_name: 'Heidi',
      last_name: 'Sassin',
      color_id: parseInt(colorOne3.color_id),
      family_id: parseInt(familyOne.family_id),
      created_at: new Date(),
      updated_at : new Date()
    }).save().then(function(new_family_member){
        colorOne3.family_member_id = new_family_member.family_member_id;
    }).catch(function(error){
      console.log(error);
    });

    const familyTwo = await family.findOne({
      where: {
        family_id: 2
      }
    });

    const colorFour = await color.findOne({
      where: {
        name: 'gray'
      }
    });

    await family_member.build({
      username: 'john.smith',
      password : bcrypt.hashSync('mysecret', 8),
      first_name: 'John',
      last_name: 'Smith',
      color_id: parseInt(colorFour.color_id),
      family_id: parseInt(familyTwo.family_id),
      created_at: new Date(),
      updated_at : new Date()
    }).save().then(function(new_family_member){
        colorOne.family_member_id = new_family_member.family_member_id;
    }).catch(function(error){
      console.log(error);
    });

  }
};
