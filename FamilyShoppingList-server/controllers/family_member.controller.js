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

  // this is a SET - MINUS operation, which is not supported by sequelize
  // it should return all available colors by looking at the available
  // colors and subtract (MINUS) the color being used in the table family_member.
  // The left join will help with that:
  //   colors (left join on) family_members ON color & family_id WHERE family_id IS NULL
  //
  //   the family_id IS NULL is the important part (it's a foreign key but will be NULL,
  //    if the left join doesn't have a value)
  db.sequelize.query(`SELECT color.color_id, color.name FROM shopping_list_db.color  
                      LEFT JOIN shopping_list_db.family_member 
                      ON color.color_id=family_member.color_id AND family_id=${req.query.family_id} 
                      WHERE family_id is null;`)
    .then(color => {
      console.log('color',color);
      res.send(color[0]);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving all available colors."
      });
    });

    // color.scope('excludeCreatedAtUpdateAt').findAll({
    //     attribute:  ['color_id', 'name'],
    //     include: { association: 'family_member_to_color', attributes : ['color_id', 'family_member_id', 'name'] },
    //     where: {
    //         family_id: req.query.family_id
    //     } 
    // })
    //   .then(data => {
    //     res.send(data);
    //   })
    //   .catch(err => {
    //     res.status(500).send({
    //       message:
    //         err.message || "some error occurred while retrieving family_member.colors."
    //     });
    //   });
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


exports.createFamilyMember = (req, res) => {

  family_member.build({
    username: req.body.username,
    password : bcrypt.hashSync(req.body.password, 8),
    first_name: req.body.first_name,
    last_name:  req.body.last_name,
    color_id: parseInt(req.body.color_id),
    family_id: parseInt(req.body.family_id),
    created_at: new Date(),
    updated_at : new Date()
  }).save().then(fm => {
    res.send(fm);
  }).catch(function(error){
    console.error(error);
  });
};




exports.login = (req, res) => {

  console.log('in login:' + JSON.stringify(req.body));

  console.log('req.body.username:' + req.body.username);


   family_member.scope('excludeCreatedAtUpdateAt').findOne({
      attributes: ['family_member_id', 'username', 'password', 'first_name', 'last_name', 'family_id' ], 
      include: [
                  { association: 'family_member_to_family', attributes : ['family_code'] }, 
                  { association: 'family_member_to_color', attributes : ['color_id', 'family_member_id', 'name'] }
               ], 
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
          family_code: family_member.family_member_to_family.family_code,
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
