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

function resolveFullPath2(el, attribute, ret = []){
  if(el === document.body){
    console.log("path", ret);
    return ret.reverse().filter((i) => i !== undefined).join('.');
  }

  //childest;
  const parent = el.parentNode;
  let key, next = true;
  if(el.hasAttribute(attribute)){
    key = el.getAttribute(attribute);
    ret.push(key.replace('./', ''));
    next = key.substr(2) === './';
  }

  if(parent.hasAttribute('data-mve-list')){
    ret.push(Array.from(el.children).reduce((acc, curr, i, arr) => (curr === el ? i : acc), undefined));
    ret.push(parent.getAttribute('data-mve-list'));
  } else if(parent.hasAttribute('data-mve-with')){
    const key = parent.getAttribute('data-mve-with');
    ret.push(key.replace('./', ''));
    next = key.substr(2) === './';
  }

  //if(next){
    return resolveFullPath(parent, attribute, ret);
  //}
/*
  console.log("resolve", el, parent);
  if(el.hasAttribute('data-mve-list')){
    const index = Array.from(el.children).reduce((acc, curr, i, arr) => (curr === el ? i : acc), -1);
    return el.getAttribute('data-mve-list').replace('./', resolveFullPath(parent, attribute) + '.') + '.' + index;
  } else if(el.hasAttribute('data-mve-with')){
    return el.getAttribute('data-mve-with').replace('./', resolveFullPath(parent, attribute) + '.') ;
  } else if(el.hasAttribute(attribute)){
    return el.getAttribute(attribute).replace('./', resolveFullPath(parent, attribute) + '.');
  } else {

    return resolveFullPath(parent, attribute, ret);
  }*/
}

function resolveFullPath(el, attribute){
  if(el === document.body){
    return '';
  }

  const parent = el.parentNode;
  if(parent.hasAttribute('data-mve-list')){
    const index = Array.from(parent.children).reduce((acc, curr, i, arr) => (curr === el ? i : acc), -1);
    return parent.getAttribute('data-mve-list').replace('./', resolveFullPath(parent.parentNode, attribute) + '.') + '.' + index;
  } else if(el.hasAttribute('data-mve-with')){
    return el.getAttribute('data-mve-with').replace('./', resolveFullPath(parent, attribute) + '.') ;
  } else if(el.hasAttribute(attribute)){
    const attr = el.getAttribute(attribute);
    const ending = attr === './' ? '' : '.';
    return attr.replace('./', resolveFullPath(parent, attribute) + ending);
  } else {

    return resolveFullPath(parent, attribute);
  }
}


function modifyList(type, el){
  const datapath = resolveFullPath(el, 'data-mve-list');
  const listEl = el.parentNode;
  const [,listpath, index] = datapath.match(/(.*)\.([0-9]*)/);
  const list = _get(_content, listpath);

  console.log("modify", type, el, datapath, listpath, index);

  removeEditorModules(el, datapath);

  switch(type){
    case 'clone':
      list.splice(index, 0, JSON.parse(JSON.stringify(list[index]))); //deep clone
      _set(_content, listpath, list);
      const clone = el.cloneNode(true);
      listEl.insertBefore(clone, el);
      addEditorModules(el, true);
      addEditorModules(clone, true);
      break;
    case 'delete':
      list.splice(index, 1);
      _set(_content, listpath, list);
      listEl.removeChild(el);
      break;
    case 'up':
    case 'down':
      const item = list.splice(index, 1)[0];
      list.splice(type === 'up' ? +index -1 : +index + 1, 0, item);
      _set(_content, listpath, list);
      const toEl = listEl.children[type === 'up' ? +index - 1 : +index + 2];
      listEl.insertBefore(el, toEl);
      addEditorModules(el, true);
      break;
    default:
      addEditorModules(el, true);
  }
}

function onEditorBlur(evt){
  const el = evt.target;
  const path = resolveFullPath(el, 'data-mve-html');
  removeEditorModules(el, path);
  _set(_content, path, el.innerHTML);
  addEditorModules(el, true);
}

function onTextBlur(evt){
  const el = evt.target;
  const path = resolveFullPath(el, 'data-mve-text');
  console.log("text", path);
  _set(_content, path, el.innerHTML);
}

function addEditorToElement(el, type) {
  const path = resolveFullPath(el, 'data-mve-' + type);
  const data = _get(_content, path);
  switch(type){
    case 'image':
      el.addEventListener('click', () => {
        _activeUpload = el;
        _upload.click();
      });
      break;
    case 'text':
      el.setAttribute('contenteditable', true);
      el.innerHTML = data;
      el.addEventListener('blur', onTextBlur);
      break;
    case 'html':
      _editors[path] = new MediumEditor(el);
      el.innerHTML = data;
      el.addEventListener('blur', onEditorBlur);
      break;
  }
  el.addEventListener('mouseover', (evt) => el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)');
  el.addEventListener('mouseout', (evt) => el.style.backgroundColor = null);
}

function addItemMenuToElement(el) {
  html.addItemMenu(el, modifyList);
}

function parseFile(evt){
  const el = _activeUpload;
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
  const qsa = (selector) => Array.from(rootNode.querySelectorAll(selector));
  const types = ['html', 'text', 'image'];

  types.map((type) => {
    qsa('[data-mve-' + type + ']').map((el) => addEditorToElement(el, type));
  })

  qsa('[data-mve-list]').map((listel) => {
    const kids = Array.from(listel.children).filter((el) => !el.classList.contains('__menuContainer'));
    kids.map(addItemMenuToElement);
  });

  if(addToRoot){
    types.map((type) => {
      if(rootNode.hasAttribute('data-mve-' + type)){
        addEditorToElement(rootNode, type);
      }
    });
    if(rootNode.parentNode.hasAttribute('data-mve-list')){
      addItemMenuToElement(rootNode);
    }
  }
}

function removeEditorModules(rootNode, datapath){
  const qsa = (selector) => Array.from(rootNode.querySelectorAll(selector));

  Object.keys(_editors).filter((key) => key.indexOf(datapath) === 0).map((key) => {
    _editors[key].destroy();
  });
  qsa('[data-mve]').map((el) => {
    el.removeEventListener('blur', onEditorBlur);
  });
  rootNode.style.backgroundColor= null;
  const menu = rootNode.querySelector(':scope > .__menuContainer');
  if(menu){
    rootNode.removeChild(menu);
  }
}

html.addThirdPartyCSS();
html.addSaveButton(saveContent);
_upload = html.addUploadButton(parseFile);

service.load((content) => {
  _content = content;

  addEditorModules();

  document.querySelector('body').classList.add('mve-editing');

  window.addEventListener('keydown', (evt) => {
    if(evt.key === 's' && evt.ctrlKey){
      evt.preventDefault();
      saveContent();
    }
  });
});
