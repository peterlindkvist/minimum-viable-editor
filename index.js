const router = require('express').Router();
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

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

function content(req, res, next){
  _storage.load((err, data) => {
    req.content = data;
    next(err);
  });
}

router.post('/content/', bodyParser.json(), (req, res, next) => {
  _storage.save(req.body, function(err) {
    _storage.load((err, data) => res.json(data));
  });
});

router.get('/content/', (req, res, next) => {
  _storage.load((err, data) => res.json(data));
});

router.get('/assets/loader.js', (req, res, next) => {
  const file = path.join(__dirname, 'assets', 'loader.js');
  fs.readFile(file, 'utf-8', (err, data) => {
    const config = {
      hash : _config.hash,
      index : req.originalUrl.replace('loader.js', 'index.js')
    }
    data = data.replace('MVE_CONFIG', JSON.stringify(config));
    res.end(data);
  });
});

router.get('/assets/index.js', (req, res, next) => {
  res.sendFile(path.join(__dirname, 'assets', 'index.js'));
});

module.exports = {
  init,
  content,
  router
}
