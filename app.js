const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const auth = require('http-auth');
const treeEditor = require('./server/treeEditor');

const contentRouter = express.Router();
const assetsRouter = express.Router();


let _config, _storage;

function init(config){
  _config = config;
  switch(config.storage){
    case 'file':
    default:
      _storage = require('./server/storage/fileStorage');
  }
  _storage.init(config);
}


function addContent(lang = '', addMetaData = false){
  return (req, res, next) => {
    getContent(lang).then((data) => {
      const langPath = lang === '' ? '' :  '/' + lang;
      if(addMetaData){
        req.content = Object.assign({}, {
          _mve : {
            lang,
            loader : _config.editorUrl + '/assets' + langPath + '/loader.js',
            index : _config.editorUrl + '/assets' + langPath + '/index.js'
          }
        }, data);
      } else {
        req.content = data;
      }
      next();
    }).catch(next);
  }
}

function getContent(lang){
  return _storage.load(lang);
}

contentRouter.post('/content/:lang?', bodyParser.json(), (req, res, next) => {
  _storage.save(req.params.lang, req.body).then(() => {
    return getContent(req.params.lang);
  }).then((data) => res.json(data)).catch(next);
});

contentRouter.get('/content/:lang?', (req, res, next) => {
  getContent(req.params.lang).then((data) => res.json(data)).catch(next);
});

contentRouter.post('/files/', fileUpload(), (req, res, next) => {
  const name = Object.keys(req.files)[0];
  _storage.upload(req.files[name], name).then((path) => {
    res.end(path);
  }).catch(next);
});

assetsRouter.use('/files/:filename', (req, res, next) => {
  res.sendFile(path.join(_config.filesPath,req.params.filename));
});

assetsRouter.get('/assets(/:lang?)/loader.js', (req, res, next) => {
  const config = {
    hash : _config.hash,
    lang : req.params.lang || '',
    index : req.originalUrl.replace('loader.js', 'index.js')
  }
  _serveAsset('loader.js', config, res);
});

assetsRouter.get('/assets(/:lang?)/index.js', (req, res, next) => {
  const config = {
    editorUrl : _config.editorUrl,
    lang : req.params.lang || ''
  }
  _serveAsset('index.js', config, res);
});

function _serveAsset(filename, config, res){
  const file = path.join(__dirname, 'assets', filename);
  fs.readFile(file, 'utf-8', (err, data) => {
    data = data.replace('MVE_CONFIG', JSON.stringify(config));
    res.end(data);
  });
}

function basicAuth(){
  return auth.connect(auth.basic({ realm: "Content Editor" }, (username, password, callback) => {
    callback(_config.users.indexOf(username + ':'+ password) !== -1);
  }));
}


function simpleSetup(config){
  const dataPath = config.dataPath || path.join(__dirname, '..', 'data');

  const conf = Object.assign({}, {
    storage : 'file',
    contentPath : dataPath,
    filesPath :  path.join(dataPath, 'files'),
    lang : {params : 'lang'},
    editorUrl : '/mve',
    hash : 'editor',
    users : [],
    splitContent : false,
    auth : basicAuth
  }, config);

  init(conf);

  const router = express.Router();

  router.use(conf.editorUrl, assetsRouter); // add the public assets router
  router.use(conf.editorUrl, conf.auth, contentRouter); // add the private content router (behind some kind of authentification)
  return router;
}

module.exports = {
  init,
  getContent,
  addContent,
  contentRouter,
  assetsRouter,
  simpleSetup,
  basicAuth,
  treeEditor : treeEditor.render
}
