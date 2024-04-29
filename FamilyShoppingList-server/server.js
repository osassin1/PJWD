const express = require("express");
const app = express();
const cors = require("cors");

// Configuration of the server with port and who can access
// the server compliant with CORS (Cross-Origin Resource Sharing)
//
// more info: 
//
// https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
//
const port = 8085;

var allowedlist = [
  'http://localhost:8089'
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
app.use(express.json());  // for images this needs to be changed when handling it
app.use(express.urlencoded({ extended: true }));

// Initialize sequelize with all database related models.
const models = require("./models");
models.sequelize.sync().then( () => {
  console.log("> database has been synced");
}).catch(function (err) {
  console.log(" > there was an issue synchronizing the database", err);
});

// If someone makes a call to the server then by default
// reply with a welcome message
app.get('/', function (req, res) {
  res.send("Welcome to FamilyShoppingList!");
});

// These are the supported components/servers from
// the application (client). For each package a router 
// and controller is required
require("./routes/authentication.routes")(app);
require("./routes/family_member.routes")(app);
require("./routes/inventory.routes")(app);
require("./routes/shopping_list.routes")(app);

// The server has started and listens for requests
// at the port.
app.listen(port, () => {
  console.log("> express server has started");
});

console.log("*** FamilyShoppingList Server ***\n");
console.log("runing in mode: ", process.env.NODE_ENV);
console.log("listing at port: ", port);