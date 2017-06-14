const express = require('express');
const path = require('path');
const auth = require('http-auth');

const treeEditor = require('./server/treeEditor');
const contentRouter = require('./server/routers/content');
const assetsRouter = require('./server/routers/assets');

let _config, _storage;

function setup(config){
  _config = config;
  assetsRouter.setup(config);
  contentRouter.setup(config);
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
    auth : basicAuth(),
    mediumOptions : undefined
  }, config);

  setup(conf);

  const router = express.Router();

  router.use(conf.editorUrl, assetsRouter); // add the public assets router
  router.use(conf.editorUrl, conf.auth, contentRouter); // add the private content router (behind some kind of authentification)
  return router;
}

module.exports = {
  setup,
  getContent : contentRouter.getContent,
  addContent : contentRouter.addContent,
  getMetaData : contentRouter.getMetaData,
  contentRouter : contentRouter,
  assetsRouter : assetsRouter,
  simpleSetup,
  basicAuth,
  treeEditor : treeEditor.render
}
