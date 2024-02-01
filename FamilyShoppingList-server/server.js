const express = require("express");
const app = express();
const cors = require("cors");

// var corsOptions = {
//     origin : "http://localhost:8081"
// };


var whitelist = ['http://localhost', 
                 'http://localhost:8081',
                 'http://172.23.165.147:8081',
                 'http://172.23.165.147',
                ]
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
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


require("./routes/family_member.routes")(app);
require("./routes/inventory.routes")(app);
require("./routes/shopping_list.routes")(app);


// app.listen(8080, function () {
//     console.log("> express server has started");
// });

app.listen(8080, function () {
    console.log("> express server has started");
});


console.log("*** FamilyShoppingList Server ***\n");
console.log(process.env.NODE_ENV);