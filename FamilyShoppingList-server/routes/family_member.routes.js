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
  
    // retrieve one family_members with 'password'
    //router.post("/login", family_member.login);
    //router.get("/validate_token", family_member.validateToken);
    // retrieve all family_members exclude 'password'
    //router.get("/", family_member.findAll);

    // Retrieve all available colors for a family for a given
    // family id.
    router.get("/colors", family_member.findAllColors);

    // Retrieve the family_id based on the generated family code.
    router.get("/family_code", family_member.findFamilyCode);

    // Retrieve the family id based on the family code.
    router.get("/family_id", family_member.getFamilyID);

    // Generate a new family code that needs to be used
    // to join an existing family
    router.get("/new_family_code", family_member.getNewFamilyCode);
    
    // This is used to check if a username alreayd
    // exists when a new family member signs up. The
    // app requires unique usernames.
    router.get("/username", family_member.findUsername);

    // Create new family_member with unique username, a
    // chosen color and connected to a unique family code.
    router.post("/create", family_member.createFamilyMember);

    app.use('/api/family_member', router);
  };
  