const express = require("express");
const app = express();
const models = require("./models");
models.sequelize.sync().then(function () {
    console.log("> database has been synced");
    }).catch(function (err) {
    console.log(" > there was an issue synchronizing the database", err);
});
app.get('/', function (req, res) {
    res.send("Welcome to FamilyShoppingList!");
});
app.listen(3000, function () {
    console.log("> express server has started");
});



console.log("*** FamilyShoppingList Server ***\n");
console.log(process.env.NODE_ENV);