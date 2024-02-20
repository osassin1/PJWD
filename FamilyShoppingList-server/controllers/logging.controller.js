
const { Map, List } = require('immutable');
const logFile = require('fs');
const {parse, stringify, toJSON, fromJSON} = require('flatted');


exports.logEntry = (req, res) => {

  var logEntry = "{ \"entry\" : { \"date\" : \"" + 
                 new Date().toISOString() + "\" } ,  " +  req.body.log + " }\n";

  logFile.appendFileSync('shoppinglist.log', logEntry, function(err) {
    if( err ) {
      res.status(500).send({message: err.message || "logging::logEntry error"});
    }
    else {
      res.status(200).send({message: ok});
    }
  })
}

exports.logEntryLocal = (name, value) => {
    var logEntry = "{ \"entry\" : { \"date\" : \"" + 
    new Date().toISOString() + "\" } ,  \"" +  name  + "\" : " 
    + stringify(value) + " }\n";

    logFile.appendFileSync('shoppinglist.log', logEntry, function(err) {
        if( err ) throw err;
    })

}

