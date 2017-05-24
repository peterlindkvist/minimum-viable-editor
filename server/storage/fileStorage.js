const fs = require('fs-extra');

let _config;

function init(config){
  _config = config;
}

function getFileName(name, key, ending = '.json'){
  const file = key ? '/' + key : '';
  return _config.contentPath + '/' + (name || 'content') + file + ending;
}

function save(lang, content){
  if(_config.splitContent){
    return Promise.all(Object.keys(content).map((key) => {
      return fs.writeJSON(getFileName(lang, key), content[key], {spaces: 2});
    }));
  } else {
    return fs.writeJSON(getFileName(lang), content, {spaces: 2});
  }
}

function load(lang){
  if(_config.splitContent){
    let ret = {};
    return fs.readdir(getFileName(lang, undefined, '')).then((files) => {
      return Promise.all(files.map((file) => {
        return fs.readJson(getFileName(lang, file, '')).then((content) => {
          ret[file.replace('.json', '')] = content;
        });
      })).then(() => ret);;
    });
  } else {
    return fs.readJson(getFileName(lang));
  }
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
