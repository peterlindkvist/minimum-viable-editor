function createElement(tagName = 'div', style = {}, attributes = {}){
  const el = document.createElement(tagName);
  Object.keys(style).map((key) => {
    el.style[key] = style[key];
  });
  Object.keys(attributes).map((key) => {
    el.setAttribute(key, attributes[key])
  });
  return el;
}

function addMediumEditorCSS(){
  ['medium-editor.min.css', 'themes/default.min.css'].map((file) => {
    const attributes = {
      rel: 'stylesheet',
      href: '//cdn.jsdelivr.net/medium-editor/5.22.2/css/' + file,
      type: 'text/css',
      charset: 'utf-8',
    }
    const el = createElement('link', {}, attributes);
    document.getElementsByTagName('head')[0].appendChild(el);
  });
}

function addSaveButton(callback){
  const style = {
    position: 'fixed',
    bottom: '10px',
    right: '10px',
    fontSize: '2em'
  }
  const el = createElement('button', style);
  el.innerHTML = '&#128190;';
  document.getElementsByTagName('body')[0].appendChild(el);
  el.addEventListener('click', callback);
  return el;
}

function addUploadButton(callback){
  const style =  {
    display : 'none'
  }
  const attributes = {
    type : 'File'
  }
  const el = createElement('input', style, attributes);
  document.getElementsByTagName('body')[0].appendChild(el);
  el.addEventListener('change', callback, false);

  return el;
}

function createItemMenuButton(type, x, y, content){
  const size = 20;
  const isMenu = type === 'menu';
  const style = {
    backgroundColor : 'gray',
    boxShadow: '2px 2px 5px darkgray',
    width : size + 'px',
    height : size + 'px',
    borderRadius : size / 2 + 'px',
    position : 'absolute',
    bottom : -y + 'px',
    right : -x + 'px',
    zIndex : 1000,
    textAlign : 'center',
    display : isMenu ? 'block' : 'none'
  }
  const attributes = {
    name : type,
    'class' : '__menuButton'
  }
  const el = createElement('button', style, attributes);
  el.innerHTML = content;
  return el;
}

function addItemMenu(itemel, callback){
  let open = false;
  const menuButton = createItemMenuButton('menu', 5, 5, '···');
  const buttons = [
    createItemMenuButton('clone', -20, -20, '&#9112;'),
    createItemMenuButton('delete', -0, -20, '&#128465;'),
  ];

  itemel.appendChild(menuButton);

  buttons.map((el) => {
    menuButton.appendChild(el);
    el.addEventListener('click', (evt) => {
      callback(evt.target.getAttribute('name'), itemel);
    });
  });

  menuButton.addEventListener('click', (evt) => {
    open = !open;
    buttons.map((el) => {
      el.style.display = open ? 'block' : 'none';
    });
  });


  return menuButton;
}

module.exports = {
  addMediumEditorCSS,
  addSaveButton,
  addUploadButton,
  addItemMenu
}
