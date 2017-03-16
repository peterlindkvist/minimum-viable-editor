const _get = require('lodash.get');
const _set = require('lodash.set');
const MediumEditor = require('medium-editor');
const html = require('./html');
const service = require('./service');

const CONTENT_API = '/editor/content/';
let _content, _upload, _activeUpload, _editors = {};

function saveContent(evt){
  document.activeElement.blur();
  service.save(_content, (data) => {
    console.log("saved");
  });
}

function updateIndexes(listEl, listpath){
  const children = Array.from(listEl.querySelectorAll('[data-mve-item]'))
  children.map((el, i) => {
    const path = el.getAttribute('data-mve-item')
    const newpath = path.replace(/(.*)\.([0-9]*)/, (fp, lp, pos) => {
      return lp === listpath ? listpath + '.' + i : fp;
    });
    el.setAttribute('data-mve-item', newpath);
  });
}

function modifyList(type, el, moveToIndex){
  const datapath = el.getAttribute('data-mve-item');
  const listEl = el.parentNode;
  const [,listpath, index] = datapath.match(/(.*)\.([0-9]*)/);
  const list = _get(_content, listpath);

  //remove editor
  Object.keys(_editors).filter((key) => key.indexOf(datapath) === 0).map((key) => {
    _editors[key].destroy();
  });
  el.removeChild(el.querySelector('.__menuButton'));

  switch(type){
    case 'clone':
      _editors[datapath]
      const clone = el.cloneNode(true);
      list.splice(index, 0, list[index]);
      listEl.insertBefore(clone, el);
      updateIndexes(listEl, listpath);
      addEditorModules(el, true);
      addEditorModules(clone, true);
      break;
    case 'delete':
      list.splice(index, 1);
      listEl.removeChild(el);
      updateIndexes(listEl, listpath);
      break;
  }
}

function addEditorToElement(el) {
  const path = el.getAttribute('data-mve');
  const data = _get(_content, path);
  switch(el.tagName){
    case 'IMG':
      el.addEventListener('click', () => {
        _activeUpload = el;
        _upload.click();
      });
      break;
    case 'A':
    //disable click?
    default :
      _editors[path] = new MediumEditor(el);
      el.innerHTML = data;
      el.addEventListener('blur', (evt) => {
        _set(_content, path, el.innerHTML);
      });
      break;
  }
}

function addItemMenuToElement(el) {
  html.addItemMenu(el, modifyList);
}

function parseFile(evt){
  const el = _activeUpload;
  console.log("parseFile", el, evt.target.files);
  const file = evt.target.files[0];
  const reader = new FileReader();
  reader.onloadend = function () {

    const blob = new Blob([reader.result], {type : file.type});

    service.uploadFile(blob, file.name, function(filepath){
      _set(_content, el.getAttribute('data-mve'), {
        src : filepath
      });
      el.setAttribute('src', filepath);
    });
  };

  reader.readAsArrayBuffer(file);
}

function addEditorModules(rootNode = document, addToRoot = false){
  const editElements = Array.from(rootNode.querySelectorAll('[data-mve]'));
  const listElements = Array.from(rootNode.querySelectorAll('[data-mve-item]'));

  console.log("addEditorModules", rootNode, listElements);

  editElements.map(addEditorToElement);
  listElements.map(addItemMenuToElement);
  if(addToRoot){
    addItemMenuToElement(rootNode);
  }
}

html.addMediumEditorCSS();
html.addSaveButton(saveContent);
_upload = html.addUploadButton(parseFile);

service.load((content) => {
  _content = content;

  addEditorModules();

  window.addEventListener('keydown', (evt) => {
    if(evt.key === 's' && evt.ctrlKey){
      evt.preventDefault();
      saveContent();
    }
  });
});
