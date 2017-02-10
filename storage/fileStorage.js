const fs = require('fs');

let _config;

function init(config){
  _config = config;
}

function save(content, callback){
  const jsonStr = JSON.stringify(content, null, 2);
  fs.writeFile(_config.filePath, jsonStr, callback);
}

function load(callback){
  fs.readFile(_config.filePath, 'utf8', (err, data) => {
    callback(err, err ? null : JSON.parse(data));
  });
}

module.exports = {
  init,
  save,
  load
}
