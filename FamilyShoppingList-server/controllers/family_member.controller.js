const db = require("../models");
const family_member = db.family_member;
const color = db.color;

const Op = db.Sequelize.Op;

// retrieve all family_members from the database.
exports.findAll = (req, res) => {
  const title = req.query.title;

    family_member.findAll({
        attributes: ['family_member_id', 'username', 'first_name', 'last_name', 'color.name' ], 
        include: { model: color, as: 'color', attributes : ['color_id', 'family_member_id', 'name'] } 
       }
    )
    .then(data => {
        console.log(data);
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving family_member."
      });
    });
};

exports.findAllColors = (req, res) => {
  
    color.scope('excludeCreatedAtUpdateAt').findAll({
        attribute:  ['color_id', 'family_member_id', 'name'],
        where: {
            family_member_id: null
        } 
    })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving family_member.colors."
        });
      });
  };
  
exports.login = (req, res) => {

  console.log('in login:' + JSON.stringify(req.body));
  family_member.scope('excludeCreatedAtUpdateAt').findOne({
      attributes: ['family_member_id', 'username', 'password', 'first_name', 'last_name', 'color.name' ], 
      include: { model: color, as: 'color', attributes : ['color_id', 'family_member_id', 'name'] }, 
      where: {
        username: req.body.username
      }
  }).then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while login family_member."
      });
    });

};
