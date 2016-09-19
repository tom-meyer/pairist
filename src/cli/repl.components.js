var fs = require('fs');
var files = fs.readdirSync(__dirname);
files.forEach(function(file) {
  if (file.match('^repl\..*\.js$') && file !== 'repl.components.js') {
    var mod = require('./' + file)
    console.log('loading', file, mod.name);
    module.exports[mod.name] = mod;
  }
});

