const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');

const contentRouter = express.Router();
const assetsRouter = express.Router();
let _config, _storage;

function init(config){
  _config = config;
  switch(config.storage){
    case 'file':
    default:
      _storage = require('./storage/fileStorage');
  }
  _storage.init(config);
}

function addContent(req, res, next){
  getContent((err, data) => {
    req.content = data;
    next(err);
  });
}

function getContent(callback){
  _storage.load(callback);
}

contentRouter.post('/content/', bodyParser.json(), (req, res, next) => {
  _storage.save(req.body, function(err) {
    getContent((err, data) => res.json(data));
  });
});

contentRouter.get('/content/', (req, res, next) => {
  getContent((err, data) => res.json(data));
});

contentRouter.post('/files/', fileUpload(), (req, res, next) => {
  const name = Object.keys(req.files)[0];
  _storage.upload(req.files[name], name, (err, path)=>{
    res.end(path);
  });
});

assetsRouter.use('/files/:filename', (req, res, next) => {
  res.sendFile(_config.filesPath + '/' + req.params.filename);
});

assetsRouter.get('/assets/loader.js', (req, res, next) => {
  const config = {
    hash : _config.hash,
    index : req.originalUrl.replace('loader.js', 'index.js')
  }
  _serveAsset('loader.js', config, (err, data) => res.end(data));
});

assetsRouter.get('/assets/index.js', (req, res, next) => {
  const config = {
    editorUrl : _config.editorUrl
  }
  _serveAsset('index.js', config, (err, data) => res.end(data));
});

function _serveAsset(filename, config, callback){
  const file = path.join(__dirname, 'assets', filename);
  fs.readFile(file, 'utf-8', (err, data) => {
    data = data.replace('MVE_CONFIG', JSON.stringify(config));
    callback(err, data);
  });
}


module.exports = {
  init,
  getContent,
  addContent,
  contentRouter,
  assetsRouter
}
