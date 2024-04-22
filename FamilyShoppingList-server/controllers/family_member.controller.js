var bcrypt = require("bcryptjs");
const db = require("../models");
const { v4: familyCode } = require("uuid");

const family_member = db.family_member;
const family = db.family;

const Op = db.Sequelize.Op;


// This is a SET - MINUS operation, which is not supported by sequelize;
// it should return all available colors by looking at the available
// colors and subtract (MINUS) the color being used in the table family_member.
// The left join will help with that:
//   (1) colors (left join on) family_members ON color & family_id WHERE family_id IS NULL
//   (2) the family_id IS NULL is the important part (it's a foreign key but will be NULL,
//       if the left join doesn't have a value)

exports.findAllColors = (req, res) => {
  db.sequelize.query(`SELECT color.color_id, color.name FROM shopping_list_db.color  
                      LEFT JOIN shopping_list_db.family_member 
                      ON color.color_id=family_member.color_id AND family_id=${req.query.family_id} 
                      WHERE family_id is null;`)
    .then(color => {
      res.send(color[0]);
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "error while retrieving all available colors."
      });
    });
};

// When using an existing family code, retrieve the family id
exports.getFamilyID = (req, res) => {
  family.scope('excludeCreatedAtUpdateAt').findOne({
    attribute: ['family_id'],
    where: {
      family_code: req.query.family_code
    }
  }).then(data => {
      res.send(data);
  }).catch(err => {
      res.status(500).send({
        message:
          err.message || "some error occurred while retrieving family_code."
      });
  });
};

// Generate a new family code and send it back.
exports.getNewFamilyCode = (req, res) => {
  family.scope('excludeCreatedAtUpdateAt').create({
    family_code: familyCode(),
    created_at: new Date(),
    updated_at: new Date()
  }).then(createResult => {
    res.send(createResult);
  }).catch(err => {
      res.status(500).send({
        message:
          err.message || "some error occurred while creating new family_code."
      });
  });
}

// See if a family code exists.
exports.findFamilyCode = (req, res) => {
  family.scope('excludeCreatedAtUpdateAt').findOne({
    attribute: ['family_id'],
    where: {
      family_code: req.query.family_code
    }
  }).then(data => {
      if (data) {
        res.send("");
      } else {
        res.send("{}");
      }
  }).catch(err => {
      res.status(500).send({
        message:
          err.message || "some error occurred while retrieving family_code."
      });
  });
};

// See if a username already exists.
exports.findUsername = (req, res) => {
  family_member.scope('excludeCreatedAtUpdateAt').findOne({
    attribute: ['username'],
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

// Create a new family member and encrypt the password.
exports.createFamilyMember = (req, res) => {
  family_member.build({
    username: req.body.username,
    password: bcrypt.hashSync(req.body.password, 8),
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    color_id: parseInt(req.body.color_id),
    family_id: parseInt(req.body.family_id),
    created_at: new Date(),
    updated_at: new Date()
  }).save().then(fm => {
    res.send(fm);
  }).catch(err => {
    console.error(err);
    res.status(500).send({
      message:
        err.message || "some error occurred while creating new family member."
    });
  });
};

//--- end of file ---