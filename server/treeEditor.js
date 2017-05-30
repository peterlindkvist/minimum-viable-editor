function render(content, key, top = true){
    //if(key[0] !== '_'){
    const root = key === undefined && top;
      if(content instanceof Array){
        return html('array', key, top, content.map((node, i) => render(node, '', root)).join("\n"));
      } else if(content instanceof Object){
        return html('object', key, top, Object.keys(content).map((i) => render(content[i], i, root)).join("\n"));
      } else if(isHTML(content)){
        return html('html', key, top, content);
      } else if(isNumber(content)){
        return html('number', key, top, content);
      } else {
        return html('text', key, top, content);
      }
    //}
}

function isHTML(str){
  str += '';
  const lts = str.match(/</g);
  const gts = str.match(/>/g);
  return !!lts && !!gts && lts.length === gts.length;
}

function isNumber(str){
  return '' + str === '' + parseFloat(str);
}

function html(type, key, top, content){
  let tag = '', attr = '';
  if(key === undefined){
    return '<ul>' + content + '</ul>';
  } else if(key[0] === '_'){
     return '';
  } else {
    const ref = top ? key : './' + key;
    switch(type){
      case 'array':
        attr = key === '' ? '' : ' data-mve-list="' + ref + '"';
        tag = 'ol';
        break;
      case 'object':
        attr = key === '' ? '' : ' data-mve-with="' + ref + '"';
        tag = 'ul';
        break;
      case 'html':
        attr = ' data-mve-html="' + ref + '"';
        tag = 'div';
        break;
      case 'number':
        attr = ' data-mve-number="' + ref + '"';
        tag = 'span';
        break;
      case 'text':
        attr = ' data-mve-text="' + ref + '"';
        tag = 'span';
        break;
    }

    return '<li><strong>' + key + ': </strong><' + tag + attr + '>' + content + '</' + tag + '></li>';
  }
}

module.exports = {
  render
}
