var _get = require('lodash.get');
var _set = require('lodash.set');
var MediumEditor = require('medium-editor');

const CONTENT_API = '/editor/content/';

function loadContent(callback){
  const options =  {
    credentials: 'include'
  };
  fetch(CONTENT_API, options).then((resp) => resp.json()).then((content) => {
    callback(content);
  });
}

function addMediumEditorCSS(){
  ['medium-editor.min.css', 'themes/default.min.css'].map((file) => {
    var el = document.createElement('link');
    el.setAttribute('rel', 'stylesheet');
    el.setAttribute('href', '//cdn.jsdelivr.net/medium-editor/5.22.2/css/' + file);
    el.setAttribute('type', 'text/css');
    el.setAttribute('charset', 'utf-8');
    document.getElementsByTagName('head')[0].appendChild(el);
  });
}

function saveContent(content) {
  return (evt) => {
    const options = {
      credentials: 'include',
      body : JSON.stringify(content),
      method : 'POST',
      headers : {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    fetch(CONTENT_API, options).then(() => {
      console.log("saved");
    });
  };
}

function addSaveButton(content){
  const style = 'position:fixed ; bottom :10px ; right : 10px; font-size: 2em';
  const el = document.createElement('button');
  el.setAttribute('style', style);
  el.innerHTML = '&#128190;';
  document.getElementsByTagName('body')[0].appendChild(el);
  el.addEventListener('click', saveContent(content));
  return el;
}

function updateContent(content){
  return (el) => {
    const path = el.getAttribute('data-mve');
    el.innerHTML = _get(content, path);
    el.addEventListener('blur', (evt) => {
      _set(content, path, el.innerHTML);
    });
  };
}

addMediumEditorCSS();
loadContent((content) => {
  const elements = Array.from(document.querySelectorAll('[data-mve]'));
  addSaveButton(content);
  const editor = new MediumEditor(elements);
  elements.map(updateContent(content));
  window.addEventListener('keydown', (evt) => {
    if(evt.key === 's' && evt.ctrlKey){
      evt.preventDefault();
      saveContent(content)();
    }
  });
});
