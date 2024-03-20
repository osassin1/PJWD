const family_member = require("../models/family_member.js");

module.exports = function(app) {

  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

    const family_member = require("../controllers/family_member.controller.js");
  
    var router = require("express").Router();
  
      // retrieve all family_members exclude 'password'
    router.get("/", family_member.findAll);

    // retrieve all family_members exclude 'password'
    router.get("/colors", family_member.findAllColors);

    // retrieve family_id based on family_code
    router.get("/family_code", family_member.findFamilyCode);
    router.get("/family_id", family_member.getFamilyID);

    router.get("/new_family_code", family_member.getNewFamilyCode);
    

    // retrieve username based on family_code
    router.get("/username", family_member.findUsername);

    // retrieve one family_members with 'password'
    router.post("/login", family_member.login);

    // create new family_member
    router.post("/create", family_member.createFamilyMember);
    
    

    app.use('/api/family_member', router);
  };
  