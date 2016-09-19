var path = require('path');
var fs = require('fs');
var thisfile = path.basename(__filename);
var files = fs.readdirSync(__dirname);
files.forEach(function(file) {
  if (file.match('^repl\..*\.js$') && file !== thisfile) {
    var mod = require('./' + file)
    module.exports[mod.name] = mod;
  }
});
