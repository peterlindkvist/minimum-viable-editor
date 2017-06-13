const fs = require('fs-extra');

let _config, _cache = {};

function setup(config){
  _config = config;
}

function getFileName(name, key, ending = '.json'){
  const file = key ? '/' + key : '';
  return _config.contentPath + '/' + (name || 'content') + file + ending;
}

function clearCache(lang){
  return (params) => {
    _cache[lang] = undefined;
    return params;
  }
}

function saveCache(lang){
  return (data) => {
    if(_config.useCache){
      _cache[lang] = data;
    }
    return data;
  }
}

function save(lang, content){
  if(_config.splitContent){
    return Promise.all(Object.keys(content).map((key) => {
      return fs.writeJSON(getFileName(lang, key), content[key], {spaces: 2});
    })).then(clearCache(lang));
  } else {
    return fs.writeJSON(getFileName(lang), content, {spaces: 2}).
      then(clearCache(lang));
  }
}

function load(lang){
  if(_cache[lang] !== undefined){
    return Promise.resolve(_cache[lang]);
  } else {
    if(_config.splitContent){
      let ret = {};
      return fs.readdir(getFileName(lang, undefined, '')).then((files) => {
        return Promise.all(files.map((file) => {
          return fs.readJson(getFileName(lang, file, '')).then((content) => {
            ret[file.replace('.json', '')] = content;
          });
        })).then(() => ret);
      }).then(saveCache(lang));
    } else {
      return fs.readJson(getFileName(lang)).
        then(saveCache(lang));
    }
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
  setup,
  save,
  load,
  upload
}
