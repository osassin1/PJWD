const express = require("express");
const app = express();
const cors = require("cors");

// var corsOptions = {
//     origin : "http://localhost:8081"
// };


var allowedlist = ['http://localhost',
  'http://localhost:8081',
  'http://localhost:8089',
  'http://172.23.165.147:8081',
  'http://172.23.165.147',
  'http://192.168.1.193:8081',
  'http://192.168.1.195:8081',
  'http://192.168.1.193:8089',
  'http://192.168.1.195:8089',
  'http://osassin.tplinkdns.com'
]
var corsOptions = {
  origin: function (origin, callback) {
    if (allowedlist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}




app.use(cors(corsOptions));
app.use(express.json());  // for images this needs to be changes when handling it
app.use(express.urlencoded({ extended: true }));

const models = require("./models");

models.sequelize.sync().then(function () {
  console.log("> database has been synced");
}).catch(function (err) {
  console.log(" > there was an issue synchronizing the database", err);
});
app.get('/', function (req, res) {
  res.send("Welcome to FamilyShoppingList!");
});

require("./routes/logging.routes")(app);
require("./routes/family_member.routes")(app);
require("./routes/inventory.routes")(app);
require("./routes/shopping_list.routes")(app);


// app.listen(8080, function () {
//     console.log("> express server has started");
// });

app.listen(8085, function () {
  console.log("> express server has started");
});


console.log("*** FamilyShoppingList Server ***\n");
console.log(process.env.NODE_ENV);