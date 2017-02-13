const fs = require('fs');

let _config;

function init(config){
  _config = config;
}

function save(content, callback){
  const jsonStr = JSON.stringify(content, null, 2);
  fs.writeFile(_config.contentPath, jsonStr, callback);
}

function load(callback){
  fs.readFile(_config.contentPath, 'utf8', (err, data) => {
    callback(err, err ? null : JSON.parse(data));
  });
}

function upload(file, filename, callback){
  const filePath = _config.filesPath + '/' + filename;
  const publicUrl = _config.editorUrl + '/files/' + filename;
  console.log("upload to ", filePath);
  file.mv(filePath, (err) => {
    console.log("upload done", err);
    callback(err, publicUrl);
  });
}

module.exports = {
  init,
  save,
  load,
  upload
}
