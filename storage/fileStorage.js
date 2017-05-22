const fs = require('fs-extra');

let _config;

function init(config){
  _config = config;
}

function getFileName(name){
  return _config.contentPath + '/' + (name || 'content') + '.json';
}

function save(lang, content){
  //const jsonStr = JSON.stringify(content, null, 2);
  return fs.writeJSON(getFileName(lang), content, {spaces: 2});
}

function load(lang){
  return fs.readJson(getFileName(lang));
}

function upload(file, filename){
  const filePath = _config.filesPath + '/' + filename;
  const publicUrl = _config.editorUrl + '/files/' + filename;
  return new Promise((resolve, reject) => {
    file.mv(filePath, (err) => {
      if(err){
        reject(err);
      } else {
        resolve(publicUrl);
      }
    });
  })
}

module.exports = {
  init,
  save,
  load,
  upload
}
