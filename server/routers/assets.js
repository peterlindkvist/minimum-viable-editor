const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

let _config;

function setup(config){
  _config = config;
}

router.use('/files/:filename', (req, res, next) => {
  res.sendFile(path.join(_config.filesPath,req.params.filename));
});

router.get('/assets(/:lang?)/loader.js', (req, res, next) => {
  const config = {
    hash : _config.hash,
    lang : req.params.lang || '',
    index : req.originalUrl.replace('loader.js', 'index.js')
  }
  _serveAsset('loader.js', config, res).catch(next);
});

router.get('/assets(/:lang?)/index.js', (req, res, next) => {
  const config = {
    editorUrl : _config.editorUrl,
    lang : req.params.lang || ''
  }
  _serveAsset('index.js', config, res).catch(next);
});

function _serveAsset(filename, config, res){
  const file = path.join(__dirname, '..', '..', 'assets', filename);
  return fs.readFile(file, 'utf-8').then((data) => {
    data = data.replace('MVE_CONFIG', JSON.stringify(config));
    res.end(data);
  });
}

router.setup = setup;

module.exports = router;
