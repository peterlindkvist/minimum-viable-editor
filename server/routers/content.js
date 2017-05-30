const router = require('express').Router();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const sanitizeHtml = require('sanitize-html');
const deepMerge = require('deepmerge');
const deepMap = require('deep-map');

let _config;

function setup(config){
  _config = config;
  switch(config.storage){
    case 'file':
    default:
      _storage = require('../storage/fileStorage');
  }
  _storage.setup(config);
}

function addContent(lang = '', addMetaData = true){
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

function mergeContent(lang, remoteContent){
  return _storage.load(lang).then((localContent) => {
     const content = deepMerge(localContent, remoteContent);
     return _storage.save(lang, content).then(() => content);
  });
}

function sanitize(str){
  if('' + str === '' + parseFloat(str)){
    return parseFloat(str);
  } else {
    return sanitizeHtml(str);
  }
}

router.post('/content/:lang?', bodyParser.json(), (req, res, next) => {
  const content = deepMap(req.body, (value) => sanitize(value));
  _storage.save(req.params.lang, content).then(() => {
    return getContent(req.params.lang);
  }).then((data) => res.json(data)).catch(next);
});

router.post('/content/:lang?/merge', bodyParser.json(), (req, res, next) => {
  const content = deepMap(req.body, (value) => sanitizeHtml(value));
  mergeContent(req.params.lang, content).
    then((data) => res.json(data)).catch(next);
});

router.get('/content/:lang?', (req, res, next) => {
  getContent(req.params.lang).then((data) => res.json(data)).catch(next);
});

router.post('/files/', fileUpload(), (req, res, next) => {
  const name = Object.keys(req.files)[0];
  _storage.upload(req.files[name], name).then((path) => {
    res.end(path);
  }).catch(next);
});

router.setup = setup;
router.addContent = addContent;
router.getContent = getContent;
router.mergeContent = mergeContent;

module.exports = router;
