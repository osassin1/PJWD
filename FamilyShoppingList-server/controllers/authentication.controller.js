var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const db = require("../models");

// Use the sequelize family_member class
// for family members.
const family_member = db.family_member;

// This used for token defintion and uses
// a secret key. More info is here:
//
// https://www.npmjs.com/package/jsonwebtoken
//
const secret_key = "the-secretcy-of-the-family-shopping-list";
const experiationInSeconds = 60*60;

exports.validateToken = (req, res) => {
  jwt.verify(req.query.token, secret_key,
    (err, decoded) => {
      // If the token expired or invalid then
      // an error will be generated
      if( err ) {
        res.status(500).send( false );
      }
      else {
        // A valid token contains the family_member_id
        if( decoded['family_member_id'] == req.query.family_member_id) {
          res.send(true);
        }
      }
    });
};

// The login process involves checking the password submitted 
// with the encrypted password in the family_member table.
// If the password matches then a token is generated and
// login is confirmed. A family member object is created
// confirming with the client model:
//
//  export interface FamilyMember {
//   family_member_id: number,
//   family_code: string,
//   username: string,
//   first_name: string,
//   last_name: string,
//   token: string,
//   authdata?: string,
//   family_id: number,
//   color : {
//           color_id : number,
//           family_member_id: number,
//           name: string
//   }
// }

exports.login = (req, res) => {
  family_member.scope('excludeCreatedAtUpdateAt').findOne({
      attributes: ['family_member_id', 'username', 'password', 'first_name', 'last_name', 'family_id' ], 
      include: [
                  { association: 'family_member_to_family', attributes : ['family_code'] }, 
                  { association: 'family_member_to_color', attributes : ['color_id', 'name'] }
               ], 
      where: {
        username: req.body.username
      }
  }).then(family_member => {
      if( family_member === null ){
        return res.status(401).send({
          accessToken: null,
          message: "unkown username - please try again."
        });
      }

      var checkPassword = bcrypt.compareSync(
        req.body.password,
        family_member.password
      );
  
      if (!checkPassword) {
        return res.status(401).send({
          accessToken: null,
          message: "password mismatch - please try again."
        });
      } 

     // bezkoder. “Node.Js Express: JWT Example | Token Based Authentication & Authorization.” 
     // BezKoder (blog), November 14, 2019. https://www.bezkoder.com/node-js-jwt-authentication-mysql/.
      const token = jwt.sign({ family_member_id: family_member.family_member_id },
        secret_key,
        {
          algorithm: 'HS256',
          allowInsecureKeySizes: true,
          expiresIn: experiationInSeconds
        });

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
    }).catch(err => {
      res.status(500).send({
        message:
          err.message || "error while login family_member."
      })
    })
};

//--- end of file ---