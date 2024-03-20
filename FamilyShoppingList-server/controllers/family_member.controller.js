var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const db = require("../models");
const { v4:familyCode } = require("uuid");

const family_member = db.family_member;
const color = db.color;
const family = db.family;

const Op = db.Sequelize.Op;

// retrieve all family_members from the database.
exports.findAll = (req, res) => {

    family_member.findAll({
        attributes: ['family_member_id', 'username', 'first_name', 'last_name', 'family_id' ], 
        include: { association: 'family_member_to_color', attributes : ['color_id', 'family_member_id', 'name'] },
        where: {
          family_id: req.query.family_id   // get request
        } 
       }
    )
    .then(data => {
      //console.log(data);
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving family_member."
      });
    });
};

exports.findAllColors = (req, res) => {
    color.scope('excludeCreatedAtUpdateAt').findAll({
        attribute:  ['color_id', 'family_member_id', 'name'],
        where: {
            family_id: req.query.family_id
        } 
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "some error occurred while retrieving family_member.colors."
        });
      });
  };

  

  exports.getFamilyID = (req, res) => {
    family.scope('excludeCreatedAtUpdateAt').findOne({
        attribute:  ['family_id' ],
        where: {
            family_code: req.query.family_code
        } 
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "some error occurred while retrieving family_code."
        });
      });
  };



  exports.getNewFamilyCode = (req, res) => {
    family.scope('excludeCreatedAtUpdateAt').create({
      family_code : familyCode(),
      created_at: new Date(),
      updated_at : new Date()    
    }).then( createResult => {    
      console.log('createResult', createResult)
      res.send(createResult);
    });
}  

  exports.findFamilyCode = (req, res) => {
    family.scope('excludeCreatedAtUpdateAt').findOne({
        attribute:  ['family_id' ],
        where: {
            family_code: req.query.family_code
        } 
    })
      .then(data => {
        console.log(data);
        if( data ) {
          res.send("");
        } else {
          res.send("{}");
        }
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "some error occurred while retrieving family_code."
        });
      });
  };


  
exports.findUsername = (req, res) => {
  family_member.scope('excludeCreatedAtUpdateAt').findOne({
      attribute:  ['username' ],
      where: {
          username: req.query.username
      } 
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "some error occurred while retrieving username."
      });
    });
};


exports.login = (req, res) => {

  console.log('in login:' + JSON.stringify(req.body));

  console.log('req.body.username:' + req.body.username);


   family_member.scope('excludeCreatedAtUpdateAt').findOne({
      attributes: ['family_member_id', 'username', 'password', 'first_name', 'last_name', 'family_id' ], 
      include: { association: 'family_member_to_color', attributes : ['color_id', 'family_member_id', 'name'] }, 
      where: {
        username: req.body.username
      }
  })
  .then(family_member => {
     console.log(JSON.stringify(family_member));

      if( family_member === null ){
        return res.status(401).send({
          accessToken: null,
          message: "unkown username - please try again"
        });
      }

      var checkPassword = bcrypt.compareSync(
        req.body.password,
        family_member.password
      );
  
      if (!checkPassword) {
        return res.status(401).send({
          accessToken: null,
          message: "password mismatch - please try again"
        });
      } 

      const token = jwt.sign({ id: family_member.family_member_id },
        "the secretc of the family shopping list",
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: 86400, // 24 hours
        });

        console.log('token : ' + token );

        return res.status(200).send({
          family_member_id: family_member.family_member_id,
          username: family_member.username,
          first_name: family_member.first_name,
          last_name: family_member.last_name,
          family_id: family_member.family_id,
          color : { color_id: family_member.family_member_to_color.color_id,
                    name: family_member.family_member_to_color.name },
          token
        });
  
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while login family_member."
      });
    });



};
