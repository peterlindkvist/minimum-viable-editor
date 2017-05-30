#! /usr/bin/env node
const rp = require('request-promise-native');
const contentRouter = require('../server/routers/content');

if(process.argv.length <= 3){
  console.log("usage: mve-sync fromURI toFile");
  exit();
}

const fromURI = process.argv[2];
const toFile = process.argv[3];

const toFileParts = toFile.split('/')
const [lang, end] = toFileParts.pop().split('.');

const config = {
  storage : 'file',
  contentPath : toFileParts.join('/'),
  splitContent : end === undefined,
  lang
};

contentRouter.setup(config);

console.log("sync content: " + fromURI + " => " + toFile);

rp(fromURI).then(JSON.parse).then((data) => {
  contentRouter.mergeContent(lang, data).then(() => console.log("done!"));
});
