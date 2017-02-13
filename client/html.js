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

function addSaveButton(callback){
  const style = 'position:fixed ; bottom :10px ; right : 10px; font-size: 2em';
  const el = document.createElement('button');
  el.setAttribute('style', style);
  el.innerHTML = '&#128190;';
  document.getElementsByTagName('body')[0].appendChild(el);
  el.addEventListener('click', callback);
  return el;
}

function addUploadButton(callback){
  const el = document.createElement("input");
  el.setAttribute('type', 'File');
  el.style.display = 'none';
  document.getElementsByTagName('body')[0].appendChild(el);
  el.addEventListener('change', callback, false);

  return el;
}

module.exports = {
  addMediumEditorCSS,
  addSaveButton,
  addUploadButton
}
