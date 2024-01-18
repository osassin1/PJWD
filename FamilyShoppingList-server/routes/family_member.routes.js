const family_member = require("../models/family_member.js");

module.exports = app => {
    const family_member = require("../controllers/family_member.controller.js");
  
    var router = require("express").Router();
  
      // retrieve all family_members exclude 'password'
    router.get("/", family_member.findAll);

    // retrieve all family_members exclude 'password'
    router.get("/colors", family_member.findAllColors);
    
    app.use('/api/family_member', router);
  };
  