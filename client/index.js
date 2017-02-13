const _get = require('lodash.get');
const _set = require('lodash.set');
const MediumEditor = require('medium-editor');
const html = require('./html');
const service = require('./service');

const CONTENT_API = '/editor/content/';
let _content, _upload, _activeUpload;

function saveContent(evt){
  document.activeElement.blur();
  service.save(_content, (data) => {
    console.log("saved");
  });
}

function updateElement(el) {
  console.log("el", el.tagName);
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
      const editor = new MediumEditor(el);
      el.innerHTML = data;
      el.addEventListener('blur', (evt) => {
        _set(_content, path, el.innerHTML);
      });
      break;
  }
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

html.addMediumEditorCSS();
html.addSaveButton(saveContent);
_upload = html.addUploadButton(parseFile);

service.load((content) => {
  _content = content;
  const elements = Array.from(document.querySelectorAll('[data-mve]'));

  elements.map(updateElement);

  window.addEventListener('keydown', (evt) => {
    if(evt.key === 's' && evt.ctrlKey){
      evt.preventDefault();
      saveContent();
    }
  });
});
