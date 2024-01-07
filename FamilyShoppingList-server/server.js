const express = require("express");
const app = express();
const models = require("./models");
const Inventory = models.inventory;
const Store = models.store;

models.sequelize.sync().then(function () {
    console.log("> database has been synced");
    }).catch(function (err) {
    console.log(" > there was an issue synchronizing the database", err);
});
app.get('/', function (req, res) {
    //res.send("Welcome to FamilyShoppingList!");
    id = 15;
    Inventory.findByPk(id)
    .then(data => {
        if(data) {
            Store.findByPk(data['inventory_store_id']).then(sdata => {  
                if(sdata) {
                    res.send('<html><div><p>'+data['name']+ ' from ' + sdata['name'] + '</p>' +
                         '<img style="display:block; width:10em;height:10em;"' +
                        ' src="' + data['picture'] + '"> ' + 
                        '<p>'+data['notes']+'</p></div></html>');
                }
                else {
                    res.send(`Bo Store with id=${data['inventory_store_id']}`);
                }
            })
    } else {
        res.status(404).send({
            message: `Cannot find Inventory with id=${id}.`
          });
        }      
    })
});
app.listen(3000, function () {
    console.log("> express server has started");
});



console.log("*** FamilyShoppingList Server ***\n");
console.log(process.env.NODE_ENV);