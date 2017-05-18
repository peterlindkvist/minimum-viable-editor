const fs = require('fs');

let _config;

function init(config){
  _config = config;
}

function getFileName(name){
  return _config.contentPath + '/' + (name || 'content') + '.json';
}

function save(lang, content, callback){
  const jsonStr = JSON.stringify(content, null, 2);
  fs.writeFile(getFileName(lang), jsonStr, callback);
}

function load(lang, callback){
  fs.readFile(getFileName(lang), 'utf8', (err, data) => {
    callback(err, err ? null : JSON.parse(data));
  });
}

function upload(file, filename, callback){
  const filePath = _config.filesPath + '/' + filename;
  const publicUrl = _config.editorUrl + '/files/' + filename;
  file.mv(filePath, (err) => {
    callback(err, publicUrl);
  });
}

module.exports = {
  init,
  save,
  load,
  upload
}
