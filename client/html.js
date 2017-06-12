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

function addThirdPartyCSS(){
  [ 'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdn.jsdelivr.net/medium-editor/5.22.2/css/medium-editor.min.css',
    'https://cdn.jsdelivr.net/medium-editor/5.22.2/css/themes/default.min.css'
  ].map((file) => {
    const attributes = {
      rel: 'stylesheet',
      href: file,
      type: 'text/css',
      charset: 'utf-8',
    }
    const el = createElement('link', {}, attributes);
    document.getElementsByTagName('head')[0].appendChild(el);
  });
}

function addSaveButton(callback){
  const size = 50;
  const style = {
    position: 'fixed',
    width : size + 'px',
    height : size + 'px',
    bottom: '15px',
    right: '15px',
    fontSize: '2em',
    cursor : 'pointer',
    boxShadow: '2px 2px 5px darkgray',
    borderRadius : size / 2 + 'px',
    textAlign : 'center',
    lineHeight : 1.5,
    backgroundColor : 'white'

  }
  const attributes = {
    'class' : 'material-icons'
  }
  const el = createElement('i', style, attributes);
  el.innerHTML = 'save';
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
  const size = 30;
  const isMenu = type === 'menu';
  const style = {
    backgroundColor : 'white',
    color : 'black',
    boxShadow: '2px 2px 5px darkgray',
    width : size + 'px',
    height : size + 'px',
    borderRadius : size / 2 + 'px',
    position : 'absolute',
    top : y + 'px',
    right : -x + 'px',
    zIndex : type === 'menu' ? 1000 : 1001,
    textAlign : 'center',
    display : isMenu ? 'block' : 'none',
    cursor : 'pointer',
    paddingTop : '3px',
    paddingLeft : '2px'
  }
  const attributes = {
    'data-type' : type,
    'class' : 'material-icons',
    title  : type
  }
  const el = createElement('i', style, attributes);
  el.innerText = content;
  return el;
}

function addItemMenu(itemel, callback){
  let open = false, size = 30;
  itemel.style.position = 'relative';

  const menuContainer = createElement('div', {
    position : 'absolute',
    top : (itemel.offsetHeight / 2 - size / 2) +'px',
    right : (-size / 2)  + 'px'
  }, {
    'class': '__menuContainer'
  });
  const menuButton = createItemMenuButton('menu', 0, 0, 'menu');
  const angleOffset = Math.PI / 8;
  const pos = (angle) => [-45  * Math.sin(angle), -45  * Math.cos(angle)];
  const buttons = [
    createItemMenuButton('clone', ...pos(0 * Math.PI / 4 + angleOffset), 'content_copy'),
    createItemMenuButton('up', ...pos(1 * Math.PI / 4 + angleOffset), 'keyboard_arrow_up'),
    createItemMenuButton('down', ...pos(2 * Math.PI / 4 + angleOffset ), 'keyboard_arrow_down'),
    createItemMenuButton('delete', ...pos(3 * Math.PI / 4 + angleOffset), 'delete'),
  ];

  itemel.appendChild(menuContainer);
  menuContainer.appendChild(menuButton)

  buttons.map((el) => {
    menuContainer.appendChild(el);
    el.addEventListener('click', (evt) => {
      callback(evt.target.getAttribute('data-type'), itemel);
    });
  });

  menuButton.addEventListener('click', (evt) => {
    open = !open;
    buttons.map((el) => {
      el.style.display = open ? 'block' : 'none';
    });
    menuButton.innerText = open ? 'close' : 'menu';
  });

  menuContainer.addEventListener('mouseover', (evt) => itemel.style.backgroundColor = 'rgba(255, 0, 0, 0.1)');
  menuContainer.addEventListener('mouseout', (evt) => itemel.style.backgroundColor = null);

  return menuButton;
}

module.exports = {
  addThirdPartyCSS,
  addSaveButton,
  addUploadButton,
  addItemMenu
}
